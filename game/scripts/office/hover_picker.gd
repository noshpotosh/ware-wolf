class_name HoverPicker
extends Node2D

const Target := preload("res://scripts/office/hover_target.gd")

var hovered_target: Target
var _targets: Array[Target] = []
var _mouse_inside := true


func _ready() -> void:
	_discover.call_deferred()
	var window := get_viewport() as Window
	if window != null:
		window.mouse_exited.connect(_mouse_exited)
		window.mouse_entered.connect(_mouse_entered)


func _discover() -> void:
	for node in get_parent().find_children("*", "", true, false):
		if node is Target and not _targets.has(node):
			_targets.append(node)


func _process(_delta: float) -> void:
	if not _mouse_inside:
		return
	if not get_viewport_rect().has_point(get_viewport().get_mouse_position()):
		_set_target(null)
		return
	pick_at_world(get_global_mouse_position())


func pick_at_world(world: Vector2) -> Target:
	for node in get_tree().get_nodes_in_group(Target.GROUP):
		if node is Target and get_parent().is_ancestor_of(node):
			if not _targets.has(node):
				_targets.append(node)
	var winner: Target
	for target in _targets.duplicate():
		if not is_instance_valid(target) or not target.is_inside_tree():
			_targets.erase(target)
			continue
		if not target.contains_world_point(world):
			continue
		if winner == null or _draws_above(target, winner):
			winner = target
	_set_target(winner)
	return winner


func _draws_above(first: Target, second: Target) -> bool:
	var first_z := _effective_z(first.sprite)
	var second_z := _effective_z(second.sprite)
	if first_z != second_z:
		return first_z > second_z
	var first_anchor := _sort_anchor(first.sprite)
	var second_anchor := _sort_anchor(second.sprite)
	if first_anchor != null and second_anchor != null:
		var first_y := first_anchor.global_position.y
		var second_y := second_anchor.global_position.y
		if not is_equal_approx(first_y, second_y):
			return first_y > second_y
	return first.sprite.is_greater_than(second.sprite)


func _effective_z(item: CanvasItem) -> int:
	var depth := item.z_index
	var parent := item.get_parent() as CanvasItem
	if item.z_as_relative and parent != null:
		depth += _effective_z(parent)
	return clampi(depth, RenderingServer.CANVAS_ITEM_Z_MIN,
		RenderingServer.CANVAS_ITEM_Z_MAX)


func _sort_anchor(sprite: Sprite2D) -> Node2D:
	var item: CanvasItem = sprite
	while (item.get_parent() as CanvasItem) != null:
		var parent: CanvasItem = (item.get_parent() as CanvasItem)
		if parent.y_sort_enabled and item is Node2D:
			return item as Node2D
		item = parent
	return null


func _set_target(target: Target) -> void:
	if hovered_target == target:
		return
	if is_instance_valid(hovered_target):
		hovered_target.set_hovered(false)
	hovered_target = target
	if is_instance_valid(hovered_target):
		hovered_target.set_hovered(true)
	var cursor := Input.CURSOR_POINTING_HAND if target else Input.CURSOR_ARROW
	Input.set_default_cursor_shape(cursor)


func _unhandled_input(event: InputEvent) -> void:
	if not event is InputEventMouseButton or not _mouse_inside:
		return
	if event.button_index != MOUSE_BUTTON_LEFT or not event.pressed:
		return
	var world: Vector2 = get_canvas_transform().affine_inverse() * event.position
	var target := pick_at_world(world)
	if target != null:
		target.clicked.emit()
		get_viewport().set_input_as_handled()


func _mouse_exited() -> void:
	_mouse_inside = false
	_set_target(null)


func _mouse_entered() -> void:
	_mouse_inside = true


func _exit_tree() -> void:
	_set_target(null)
