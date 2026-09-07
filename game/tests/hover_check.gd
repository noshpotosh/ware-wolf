extends SceneTree

const Target := preload("res://scripts/office/hover_target.gd")
const Picker := preload("res://scripts/office/hover_picker.gd")
var _failures := PackedStringArray()
var _clicks := 0


func _init() -> void:
	_run.call_deferred()


func _run() -> void:
	var room := Node2D.new()
	root.add_child(room)
	var first := _make_target(room)
	var second := _make_target(room)
	_check_alpha(first)
	_check_transform(first)
	_check_visibility(first)
	_check_materials(first, second)
	_check_atlas(first)
	var picker := Picker.new()
	room.add_child(picker)
	picker.set_process(false)
	await process_frame
	_check_picker(room, picker, first, second)
	await _check_subviewport()
	if DisplayServer.get_name() != "headless":
		await _check_outline()
	room.free()
	if not _failures.is_empty():
		for failure in _failures:
			push_error(failure)
		quit(1)
		return
	print("HOVER_CHECK_OK alpha transform visibility atlas materials picker")
	quit()


func _expect(condition: bool, message: String) -> void:
	if not condition:
		_failures.append(message)


func _make_target(parent: Node) -> Target:
	var prop := Node2D.new()
	var sprite := Sprite2D.new()
	sprite.name = "Sprite"
	sprite.centered = false
	var image := Image.create(4, 4, false, Image.FORMAT_RGBA8)
	image.fill(Color.TRANSPARENT)
	image.set_pixel(1, 1, Color.WHITE)
	image.set_pixel(3, 3, Color.WHITE)
	sprite.texture = ImageTexture.create_from_image(image)
	prop.add_child(sprite)
	var target := Target.new()
	prop.add_child(target)
	parent.add_child(prop)
	return target


func _check_alpha(target: Target) -> void:
	_expect(target.contains_world_point(Vector2(1.5, 1.5)), "Opaque missed")
	_expect(not target.contains_world_point(Vector2(0.5, 0.5)),
		"Transparent pixel accepted")
	_expect(not target.contains_world_point(Vector2(4, 4)),
		"Outside edge accepted")
	target.sprite.flip_h = true
	_expect(target.contains_world_point(Vector2(2.5, 1.5)), "Flip missed")
	target.sprite.flip_h = false


func _check_transform(target: Target) -> void:
	var parent := target.get_parent() as Node2D
	parent.position = Vector2(73, -28)
	parent.rotation = 0.45
	parent.scale = Vector2(2.5, 0.7)
	target.sprite.position = Vector2(-8, 3)
	target.sprite.scale = Vector2(0.6, 3.0)
	target.sprite.skew = 0.2
	target.sprite.offset = Vector2(2, -1)
	target.sprite.centered = true
	var start := target.sprite.get_rect().position
	var opaque := target.sprite.to_global(start + Vector2(1.5, 1.5))
	var clear := target.sprite.to_global(start + Vector2(0.5, 0.5))
	_expect(target.contains_world_point(opaque), "Transformed alpha missed")
	_expect(not target.contains_world_point(clear), "Transformed clear hit")
	parent.transform = Transform2D.IDENTITY
	target.sprite.transform = Transform2D.IDENTITY
	target.sprite.offset = Vector2.ZERO
	target.sprite.centered = false


func _check_visibility(target: Target) -> void:
	target.sprite.hide()
	_expect(not target.contains_world_point(Vector2(1.5, 1.5)),
		"Hidden sprite accepted")
	target.sprite.show()
	target.get_parent().hide()
	_expect(not target.contains_world_point(Vector2(1.5, 1.5)),
		"Hidden ancestor accepted")
	target.get_parent().show()


func _check_materials(first: Target, second: Target) -> void:
	var transitions: Array[bool] = []
	first.hover_changed.connect(func(active: bool) -> void:
		transitions.append(active))
	var original := CanvasItemMaterial.new()
	first.sprite.material = original
	second.sprite.material = original
	first.set_hovered(true)
	first.set_hovered(true)
	_expect(first.sprite.material != original, "Outline missing")
	_expect(second.sprite.material == original, "Shared material changed")
	second.set_hovered(true)
	_expect(first.sprite.material != second.sprite.material,
		"Outline material shared between instances")
	first.set_hovered(false)
	second.set_hovered(false)
	_expect(first.sprite.material == original, "Material not restored")
	_expect(second.sprite.material == original, "Second material lost")
	_expect(transitions == [true, false], "Hover signal was duplicated")


func _check_atlas(target: Target) -> void:
	var original := target.sprite.texture
	var atlas := AtlasTexture.new()
	atlas.atlas = original
	atlas.region = Rect2(1, 1, 2, 2)
	target.sprite.texture = atlas
	_expect(target.contains_world_point(Vector2(0.5, 0.5)),
		"Atlas region opaque missed")
	_expect(not target.contains_world_point(Vector2(1.5, 1.5)),
		"Atlas region transparent accepted")
	target.sprite.texture = original


func _check_picker(room: Node2D, picker: Picker,
		first: Target, second: Target) -> void:
	var point := Vector2(1.5, 1.5)
	_expect(picker.pick_at_world(point) == second, "Tree order reversed")
	first.get_parent().z_index = 5
	_expect(picker.pick_at_world(point) == first, "Parent z ignored")
	first.get_parent().z_index = 0

	room.y_sort_enabled = true
	first.get_parent().position.y = 1
	first.sprite.position.y = -1
	_expect(picker.pick_at_world(point) == first, "Ground y ignored")

	first.sprite.hide()
	_expect(picker.pick_at_world(point) == second, "Hidden target picked")
	first.sprite.show()
	first.get_parent().position = Vector2.ZERO
	first.sprite.position = Vector2.ZERO
	var late := _make_target(room)
	_expect(picker.pick_at_world(point) == late, "Late target missed")
	late.clicked.connect(func() -> void: _clicks += 1)
	root.canvas_transform = Transform2D(0, Vector2(40, 20))
	root.canvas_transform = root.canvas_transform.scaled(Vector2(2, 3))

	var click := InputEventMouseButton.new()
	click.button_index = MOUSE_BUTTON_LEFT
	click.pressed = true
	click.position = picker.get_canvas_transform() * point
	picker._unhandled_input(click)
	_expect(_clicks == 1, "Camera-transformed click missed")

	picker._mouse_exited()
	_expect(picker.hovered_target == null and not late.hovered,
		"Mouse exit left outline active")
	_expect(Input.get_current_cursor_shape() == Input.CURSOR_ARROW,
		"Mouse exit left hand cursor")
	picker._mouse_entered()
	picker.pick_at_world(point)
	picker.pick_at_world(Vector2(-100, -100))
	_expect(not late.hovered, "Leaving silhouette left outline active")
	root.canvas_transform = Transform2D.IDENTITY


func _check_outline() -> void:
	var viewport := SubViewport.new()
	viewport.size = Vector2i(32, 32)
	viewport.transparent_bg = true
	viewport.render_target_update_mode = SubViewport.UPDATE_ALWAYS
	root.add_child(viewport)
	var target := _make_target(viewport)
	target.get_parent().position = Vector2(10, 10)
	target.set_hovered(true)
	await process_frame
	await RenderingServer.frame_post_draw
	var image := viewport.get_texture().get_image()
	var artwork := image.get_pixel(13, 13)
	var outline := image.get_pixel(15, 13)
	_expect(artwork.is_equal_approx(Color.WHITE), "Shader tinted artwork")
	_expect(outline.a > 0.9 and outline.r > outline.b,
		"Outline cropped at sprite edge")
	_expect(image.get_pixel(16, 13).a < 0.01, "Outline exceeds two pixels")
	viewport.free()


func _check_subviewport() -> void:
	var viewport := SubViewport.new()
	viewport.size = Vector2i(128, 128)
	viewport.handle_input_locally = true
	root.add_child(viewport)
	var room := Node2D.new()
	viewport.add_child(room)
	var fixture := _make_target(room)
	var computer := Sprite2D.new()
	computer.texture = fixture.sprite.texture
	computer.centered = false
	computer.position = Vector2(20, 20)
	fixture.get_parent().free()
	var target := Target.new()
	target.sprite_path = ^".."
	computer.add_child(target)
	room.add_child(computer)
	var picker := Picker.new()
	room.add_child(picker)
	picker.set_process(false)
	await process_frame
	_expect(target.sprite == computer, "Sprite-root target not resolved")
	_check_subviewport_input(viewport, picker, target)
	viewport.free()


func _check_subviewport_input(viewport: SubViewport, picker: Picker,
		target: Target) -> void:
	viewport.canvas_transform = Transform2D(0, Vector2(10, 5))
	viewport.canvas_transform = viewport.canvas_transform.scaled(
		Vector2(2, 3))
	var point := target.sprite.to_global(Vector2(1.5, 1.5))
	var position := viewport.canvas_transform * point
	var motion := InputEventMouseMotion.new()
	motion.position = position
	viewport.push_input(motion, true)
	picker._process(0.0)
	_expect(picker.hovered_target == target,
		"SubViewport routed motion missed transformed sprite")
	var clicks: Array[bool] = []
	target.clicked.connect(func() -> void: clicks.append(true))
	var click := InputEventMouseButton.new()
	click.position = position
	click.button_index = MOUSE_BUTTON_LEFT
	click.pressed = true
	viewport.push_input(click, true)
	_expect(clicks.size() == 1, "SubViewport routed click missed")
	motion.position = Vector2(-10, -10)
	viewport.push_input(motion, true)
	picker._process(0.0)
	_expect(picker.hovered_target == null and not target.hovered,
		"SubViewport exit did not clear hover")
