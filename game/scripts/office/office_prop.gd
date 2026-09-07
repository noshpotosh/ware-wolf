@tool
class_name OfficeProp
extends Node2D

const CELL_SIZE := Vector2(128, 64)
const FLOOR_Z_INDEX := -10
const SHADOW_COLOR := Color(0.08, 0.06, 0.04, 0.18)
const SHADOW_SCALE := 0.85
const FOOTPRINT_COLOR := Color(0.42, 0.8, 0.55, 0.9)
const ANCHOR_CROSS_RADIUS := 5.0

@export var art: OfficePropArt:
	set(value):
		if art != null and art.changed.is_connected(_queue_refresh):
			art.changed.disconnect(_queue_refresh)
		art = value
		if art != null:
			art.changed.connect(_queue_refresh)
		_queue_refresh()

@export var show_footprint: bool = false:
	set(value):
		show_footprint = value
		queue_redraw()

var _refresh_pending := false
var _footprint_polygon := PackedVector2Array()


func _ready() -> void:
	_refresh()


func _queue_refresh() -> void:
	if not is_inside_tree() or _refresh_pending:
		return
	_refresh_pending = true
	# Resource edits can arrive while physics is flushing collisions.
	_refresh.call_deferred()


func _refresh() -> void:
	_refresh_pending = false
	if not is_inside_tree():
		return

	y_sort_enabled = false
	z_index = FLOOR_Z_INDEX if art != null and art.floor_decoration else 0
	_footprint_polygon = _build_footprint()
	_refresh_sprite()
	_refresh_body()
	queue_redraw()
	update_configuration_warnings()


func _refresh_sprite() -> void:
	var sprite := get_node_or_null("Sprite") as Sprite2D
	if sprite == null:
		return

	sprite.z_index = 0
	sprite.centered = false
	sprite.texture_filter = CanvasItem.TEXTURE_FILTER_NEAREST
	sprite.texture = art.texture if art != null else null
	sprite.visible = _has_valid_drawing()
	if not sprite.visible:
		return

	sprite.scale = art.draw_size / art.texture.get_size()
	sprite.position = -art.draw_size * art.ground_anchor
	sprite.offset = Vector2.ZERO


func _refresh_body() -> void:
	var body := get_node_or_null("Body") as StaticBody2D
	var footprint := get_node_or_null("Body/Footprint") as CollisionPolygon2D
	if body != null:
		body.position = Vector2.ZERO
		body.z_index = 0
	if footprint == null:
		return

	footprint.position = Vector2.ZERO
	footprint.polygon = _footprint_polygon
	footprint.disabled = _footprint_polygon.is_empty()
	if art != null and art.floor_decoration:
		footprint.disabled = true


func _build_footprint() -> PackedVector2Array:
	if art == null or not _is_positive_size(art.footprint):
		return PackedVector2Array()

	var half_extent := art.footprint * 0.5
	var polygon := PackedVector2Array()
	for corner in [
		Vector2(-half_extent.x, -half_extent.y),
		Vector2(half_extent.x, -half_extent.y),
		Vector2(half_extent.x, half_extent.y),
		Vector2(-half_extent.x, half_extent.y),
	]:
		polygon.append(Vector2(
			(corner.x - corner.y) * CELL_SIZE.x * 0.5,
			(corner.x + corner.y) * CELL_SIZE.y * 0.5
		))
	return polygon


func _draw() -> void:
	if art == null or _footprint_polygon.is_empty():
		return

	if art.casts_shadow and not art.floor_decoration:
		var shadow := PackedVector2Array()
		for point in _footprint_polygon:
			shadow.append(point * SHADOW_SCALE)
		draw_colored_polygon(shadow, SHADOW_COLOR)

	if show_footprint:
		var outline := _footprint_polygon.duplicate()
		outline.append(outline[0])
		draw_polyline(outline, FOOTPRINT_COLOR, 1.0, true)
		var horizontal := Vector2(ANCHOR_CROSS_RADIUS, 0)
		var vertical := Vector2(0, ANCHOR_CROSS_RADIUS)
		draw_line(-horizontal, horizontal, FOOTPRINT_COLOR, 1.0, true)
		draw_line(-vertical, vertical, FOOTPRINT_COLOR, 1.0, true)


func _is_positive_size(size: Vector2) -> bool:
	return size.is_finite() and size.x > 0.0 and size.y > 0.0


func _has_valid_drawing() -> bool:
	if art == null or art.texture == null:
		return false
	if not _is_positive_size(art.texture.get_size()):
		return false
	return _is_positive_size(art.draw_size) and _has_valid_anchor()


func _has_valid_anchor() -> bool:
	var anchor := art.ground_anchor
	return (
		anchor.is_finite()
		and anchor.x >= 0.0 and anchor.x <= 1.0
		and anchor.y >= 0.0 and anchor.y <= 1.0
	)


func _get_configuration_warnings() -> PackedStringArray:
	var warnings := PackedStringArray()
	if not get_node_or_null("Sprite") is Sprite2D:
		warnings.append("The prop scene needs a Sprite2D named Sprite.")
	if not get_node_or_null("Body") is StaticBody2D:
		warnings.append("The prop scene needs a StaticBody2D named Body.")
	if not get_node_or_null("Body/Footprint") is CollisionPolygon2D:
		warnings.append("Body needs a CollisionPolygon2D named Footprint.")
	if art == null:
		warnings.append("Assign an OfficePropArt resource.")
		return warnings

	if art.id.is_empty():
		warnings.append("Art needs an id.")
	if art.display_name.strip_edges().is_empty():
		warnings.append("Art needs a display name.")
	if not _has_valid_drawing():
		warnings.append("Art needs a texture, positive size, and anchor in 0..1.")
	if not _is_positive_size(art.footprint):
		warnings.append("Art footprint must have finite, positive cell sizes.")
	return warnings
