extends SceneTree

const ROOM := preload("res://scenes/office/main_office.tscn")


func _init() -> void:
	call_deferred("_run")


func _run() -> void:
	var room := ROOM.instantiate()
	root.add_child(room)
	await process_frame
	var shell: OfficeRoomShell = room.get_node("Shell")
	assert(shell.room_size == Vector2i(11, 10))
	assert(shell.floor_outline.size() > 4)
	assert(not Geometry2D.is_point_in_polygon(
		Vector2(3.4, 9.6), shell.floor_outline))
	assert(Geometry2D.is_point_in_polygon(
		Vector2(5, 5), shell.floor_outline))
	assert(room.find_children("Founder", "", true, false).is_empty())
	var computers := room.find_children("Computer", "Sprite2D", true, false)
	assert(computers.size() == 5)
	for computer in computers:
		var target: HoverTarget = computer.get_node("HoverTarget")
		assert(target.contains_world_point(computer.to_global(Vector2(5, -50))))
		assert(not target.contains_world_point(computer.to_global(Vector2(100, 0))))
	var keyboard := room.get_node("Props/Workstation1/Tabletop/Keyboard")
	keyboard.position += Vector2(8, 4)
	var expected: Vector2 = keyboard.position
	var packed := PackedScene.new()
	assert(packed.pack(room) == OK)
	assert(ResourceSaver.save(packed, "user://main-room-check.tscn") == OK)
	var restored: Node = load("user://main-room-check.tscn").instantiate()
	assert(restored.get_node("Props/Workstation1/Tabletop/Keyboard").position
		== expected)
	restored.free()
	room.free()
	var preview := load("res://scenes/office/main_room.tscn") as PackedScene
	var main := preview.instantiate()
	root.add_child(main)
	current_scene = main
	await process_frame
	var tab := InputEventKey.new()
	tab.keycode = KEY_TAB
	tab.pressed = true
	main._unhandled_key_input(tab)
	await process_frame
	await process_frame
	assert(current_scene.scene_file_path == "res://scenes/office/main.tscn")
	current_scene._unhandled_key_input(tab)
	await process_frame
	await process_frame
	assert(current_scene.scene_file_path == "res://scenes/office/main_room.tscn")
	print("MAIN_ROOM_CHECK_OK five hover targets and editable scene roundtrip")
	quit()
