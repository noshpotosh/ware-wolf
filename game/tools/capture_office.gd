extends SceneTree

const CAPTURE_SIZE := Vector2i(1280, 720)
const MAIN_SCENE := preload("res://scenes/office/main.tscn")


func _init() -> void:
	call_deferred("_capture")


func _capture() -> void:
	var arguments := OS.get_cmdline_user_args()
	if arguments.size() < 1 or arguments.size() > 3:
		push_error("Pass PNG path, optional --hover and --main-room after --")
		quit(1)
		return
	var viewport := SubViewport.new()
	viewport.size = CAPTURE_SIZE
	viewport.render_target_update_mode = SubViewport.UPDATE_ALWAYS
	root.add_child(viewport)
	var room_scene := MAIN_SCENE
	if arguments.has("--main-room"):
		room_scene = load("res://scenes/office/main_room.tscn")
	var scene := room_scene.instantiate()
	viewport.add_child(scene)
	scene.get_node("Overlay").hide()
	if arguments.has("--hover"):
		var picker: HoverPicker = scene.get_node("HoverPicker")
		picker.set_process(false)
		var desk := "Workstation1" if arguments.has("--main-room") else "Desk"
		var computer: Sprite2D = scene.get_node(
			"Room/Props/" + desk + "/Tabletop/Computer")
		picker.pick_at_world(computer.to_global(Vector2(5, -50)))
	await process_frame
	await process_frame
	await RenderingServer.frame_post_draw
	var result := viewport.get_texture().get_image().save_png(arguments[0])
	if result != OK:
		push_error("Could not save founder room capture")
		quit(1)
		return
	print("OFFICE_CAPTURE_OK " + arguments[0])
	quit()
