@tool
class_name OfficePropArt
extends Resource

@export var id: StringName:
	set(value):
		id = value
		emit_changed()

@export var display_name: String:
	set(value):
		display_name = value
		emit_changed()

@export var texture: Texture2D:
	set(value):
		if texture == value:
			return
		if texture != null and texture.changed.is_connected(emit_changed):
			texture.changed.disconnect(emit_changed)
		texture = value
		if texture != null:
			texture.changed.connect(emit_changed)
		emit_changed()

@export var draw_size: Vector2 = Vector2(128, 128):
	set(value):
		draw_size = value
		emit_changed()

@export var ground_anchor: Vector2 = Vector2(0.5, 1.0):
	set(value):
		ground_anchor = value
		emit_changed()

@export var footprint: Vector2 = Vector2.ONE:
	set(value):
		footprint = value
		emit_changed()

@export var floor_decoration: bool = false:
	set(value):
		floor_decoration = value
		emit_changed()

@export var casts_shadow: bool = true:
	set(value):
		casts_shadow = value
		emit_changed()
