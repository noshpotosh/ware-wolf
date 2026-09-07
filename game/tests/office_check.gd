extends SceneTree

const MAIN := preload("res://scenes/office/main.tscn")
const ROOM := preload("res://scenes/office/founder_office.tscn")
const PROP := preload("res://scenes/office/plant.tscn")
const DESK := preload("res://scripts/office/desk.gd")
const EXPECTED_PROP_COUNT := 5
const ROUNDTRIP_PATH := "user://office-roundtrip.tscn"
var _failures := PackedStringArray()


func _init() -> void:
	call_deferred("_run")


func _run() -> void:
	var room := ROOM.instantiate()
	root.add_child(room)
	await process_frame
	_check_projection()
	_check_desk_projection(room)
	_check_kit(room)
	_check_tabletop(room)
	_check_shared_material(room)
	await _check_guides()
	await _check_resource_edit(room)
	await _check_roundtrip(room)
	room.free()
	if not _failures.is_empty():
		for failure in _failures:
			push_error(failure)
		quit(1)
		return
	print("OFFICE_CHECK_OK projection kit resources guides scene-roundtrip")
	quit()


func _expect(condition: bool, message: String) -> void:
	if not condition:
		_failures.append(message)


func _check_projection() -> void:
	for cell in [Vector2.ZERO, Vector2(1, 0), Vector2(3.25, 2.5)]:
		var point := OfficeRoomShell.project(cell)
		var restored := OfficeRoomShell.unproject(point)
		_expect(restored.is_equal_approx(cell), "Grid roundtrip changed cell")
	_expect(
		OfficeRoomShell.project(Vector2.ONE) == Vector2(0, 64),
		"Grid no longer uses a 128 by 64 diamond"
	)


func _check_kit(room: Node) -> void:
	var props := room.get_node("Props")
	_expect(props.y_sort_enabled, "Room must sort prop ground anchors")
	_expect(props.get_child_count() == EXPECTED_PROP_COUNT,
		"Unexpected founder kit count")
	for prop in props.get_children():
		_check_prop(prop)
		var size: Vector2 = Vector2(room.get_node("Shell").room_size)
		var shape: CollisionPolygon2D = prop.get_node("Body/Footprint")
		var fits_inside_room := true
		for corner in shape.polygon:
			var cell := OfficeRoomShell.unproject(
				room.to_local(shape.to_global(corner)))
			fits_inside_room = fits_inside_room and (
				cell.x >= 0 and cell.y >= 0
				and cell.x <= size.x and cell.y <= size.y)
		_expect(
			fits_inside_room,
			"Footprint outside room: " + prop.name
		)


func _check_prop(prop: OfficeProp) -> void:
	_expect(prop._get_configuration_warnings().is_empty(), prop.name)
	var sprite: Sprite2D = prop.get_node("Sprite")
	var shape: CollisionPolygon2D = prop.get_node("Body/Footprint")
	_expect(sprite.texture != null, "Missing texture: " + prop.name)
	_expect(shape.polygon.size() == 4, "Missing footprint: " + prop.name)
	var anchor := -prop.art.draw_size * prop.art.ground_anchor
	if prop.get_script() == DESK:
		anchor = DESK.PROJECTION * anchor
	_expect(sprite.position.is_equal_approx(anchor),
		"Anchor drift: " + prop.name)
	_expect(
		shape.disabled == prop.art.floor_decoration,
		"Collision state differs from floor decoration: " + prop.name
	)
	_expect(not prop.y_sort_enabled, "Prop children must stay together")


func _check_resource_edit(room: Node) -> void:
	var desk: OfficeProp = room.get_node("Props/Desk")
	var original: OfficePropArt = desk.art
	desk.art = original.duplicate()
	desk.art.draw_size = Vector2(200, 180)
	desk.art.ground_anchor = Vector2(0.25, 0.75)
	desk.art.footprint = Vector2(2, 1)
	await process_frame
	await process_frame
	_expect(
		desk.get_node("Sprite").position.is_equal_approx(
			DESK.PROJECTION * Vector2(-50, -135)),
		"Resource changes did not refresh artwork"
	)
	var polygon: PackedVector2Array = desk.get_node("Body/Footprint").polygon
	_expect(polygon[0] == Vector2(-32, -48), "Footprint did not refresh")
	desk.art = original
	await process_frame


func _check_desk_projection(room: Node) -> void:
	var desk: OfficeProp = room.get_node("Props/Desk")
	var sprite: Sprite2D = desk.get_node("Sprite")
	var original := sprite.transform
	desk._refresh()
	desk._refresh()
	_expect(sprite.transform.is_equal_approx(original),
		"Desk projection accumulated across refreshes")
	for edge in [Vector2(172, -58), Vector2(80, 36)]:
		var projected := sprite.transform.basis_xform(edge)
		_expect(absf(absf(projected.y / projected.x) - 0.5) < 0.001,
			"Desk edge does not follow a wall axis")
	_expect(is_zero_approx(sprite.transform.y.x),
		"Desk vertical edges are tilted")
	_expect(is_zero_approx(desk.skew), "Desk still has placement skew")


func _check_roundtrip(room: Node) -> void:
	var plant := PROP.instantiate()
	plant.name = "ExtraPlant"
	room.get_node("Props").add_child(plant)
	plant.owner = room
	plant.position = OfficeRoomShell.project(Vector2(4.25, 0.75))
	var keyboard: Sprite2D = room.get_node("Props/Desk/Tabletop/Keyboard")
	keyboard.position += Vector2(8, -4)
	var chair: Node2D = room.get_node("Props/Chair")
	chair.position += OfficeRoomShell.project(Vector2(0.25, 0))
	await process_frame
	var packed := PackedScene.new()
	_expect(packed.pack(room) == OK, "Could not pack edited room")
	_expect(ResourceSaver.save(packed, ROUNDTRIP_PATH) == OK,
		"Could not save edited room")
	var restored_scene := load(ROUNDTRIP_PATH) as PackedScene
	var restored := restored_scene.instantiate()
	root.add_child(restored)
	await process_frame
	_expect(restored.get_node("Props/Chair").position == chair.position,
		"Moved chair did not survive scene save")
	_expect(
		restored.get_node("Props/Desk/Tabletop/Keyboard").position
		== keyboard.position, "Separate keyboard placement was not saved"
	)
	var restored_plant: OfficeProp = restored.get_node("Props/ExtraPlant")
	_expect(restored_plant.position == plant.position,
		"Added prop did not survive scene save")
	_check_prop(restored_plant)
	restored.free()
	DirAccess.remove_absolute(ProjectSettings.globalize_path(ROUNDTRIP_PATH))


func _check_shared_material(room: Node) -> void:
	var shell: OfficeRoomShell = room.get_node("Shell")
	var original_floor := shell.floor_texture
	var original_wall := shell.wall_texture
	var shared := AtlasTexture.new()
	shared.atlas = original_floor
	shell.floor_texture = shared
	shell.wall_texture = shared
	shell.floor_texture = null
	_expect(shared.changed.is_connected(shell.queue_redraw),
		"Clearing floor disconnected the wall's shared material")
	shell.floor_texture = original_floor
	shell.wall_texture = original_wall
	_expect(not shared.changed.is_connected(shell.queue_redraw),
		"Unused material retained a redraw subscription")


func _check_guides() -> void:
	var main := MAIN.instantiate()
	root.add_child(main)
	var group := Node2D.new()
	main.get_node("Room/Props").add_child(group)
	var plant := PROP.instantiate()
	group.add_child(plant)
	await process_frame
	var event := InputEventKey.new()
	event.pressed = true
	event.keycode = KEY_F1
	main._unhandled_key_input(event)
	_expect(main.get_node("Room/Shell").show_grid, "F1 missed floor grid")
	for prop in main.find_children("*", "OfficeProp", true, false):
		_expect(prop.show_footprint, "F1 missed a nested prop")
	main._unhandled_key_input(event)
	_expect(not plant.show_footprint, "F1 did not hide nested guides")
	main.free()


func _check_tabletop(room: Node) -> void:
	_expect(not room.has_node("Props/Founder"), "Founder still in interior")
	var tabletop := room.get_node("Props/Desk/Tabletop")
	_expect(tabletop.get_child_count() == 3, "Expected three desk objects")
	var textures := {}
	for item in tabletop.get_children():
		_expect(item is Sprite2D, "Desktop item must be directly movable")
		textures[item.texture.resource_path] = true
	_expect(textures.size() == 3, "Desktop objects share composite artwork")
	var computer: Sprite2D = tabletop.get_node("Computer")
	var target: HoverTarget = computer.get_node("HoverTarget")
	_expect(target.sprite == computer, "Computer hover is not wired")
	var opaque := computer.to_global(Vector2(5, -50))
	_expect(target.contains_world_point(opaque), "Computer screen misses hover")
	var clear := computer.to_global(computer.get_rect().position)
	_expect(not target.contains_world_point(clear),
		"Computer transparent corner triggers hover")
