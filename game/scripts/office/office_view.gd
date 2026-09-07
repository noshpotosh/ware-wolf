extends Node2D

const VIEW_MARGIN := Vector2(100, 90)
const MAX_ZOOM := 1.25

@onready var _shell: OfficeRoomShell = $Room/Shell
@onready var _camera: Camera2D = $Camera2D
@onready var _objects: Node2D = $Room/Props


func _ready() -> void:
	get_viewport().size_changed.connect(_fit_room)
	_fit_room()


func _fit_room() -> void:
	var west := OfficeRoomShell.project(Vector2(0, _shell.room_size.y))
	var east := OfficeRoomShell.project(Vector2(_shell.room_size.x, 0))
	var south := OfficeRoomShell.project(Vector2(_shell.room_size))
	var thickness := _shell.wall_thickness
	var top_left := Vector2(west.x - thickness,
		-_shell.wall_height - thickness)
	var bottom_y := south.y + OfficeRoomShell.FLOOR_THICKNESS
	var bottom_right := Vector2(east.x + thickness, bottom_y)
	var room_bounds := Rect2(top_left, bottom_right - top_left)
	var available := get_viewport_rect().size - VIEW_MARGIN
	var fit := available / room_bounds.size
	var zoom := minf(minf(fit.x, fit.y), MAX_ZOOM)
	_camera.position = room_bounds.get_center()
	_camera.zoom = Vector2.ONE * zoom


func _unhandled_key_input(event: InputEvent) -> void:
	if not event.is_pressed() or event.is_echo():
		return
	if event is InputEventKey and event.keycode == KEY_F1:
		_shell.show_grid = not _shell.show_grid
		for prop in _objects.find_children("*", "OfficeProp", true, false):
			prop.show_footprint = _shell.show_grid
		get_viewport().set_input_as_handled()
	if event is InputEventKey and event.keycode == KEY_H:
		$Overlay.visible = not $Overlay.visible

	if event is InputEventKey and event.keycode == KEY_TAB:
		var destination := "res://scenes/office/main_room.tscn"
		if scene_file_path == destination:
			destination = "res://scenes/office/main.tscn"
		get_viewport().set_input_as_handled()
		get_tree().change_scene_to_file(destination)
