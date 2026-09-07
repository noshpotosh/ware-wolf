@tool
extends OfficeProp

# The source tabletop axes are (172, -58) and (80, 36).
# Map their slopes to -0.5 and +0.5 without tilting vertical edges.
# Apply around the ground anchor, leaving the collision grid unchanged.
const PROJECTION := Transform2D(
	Vector2(1, -0.0716396), Vector2(0, 1.2703102), Vector2.ZERO
)


func _refresh_sprite() -> void:
	var sprite := get_node_or_null("Sprite") as Sprite2D
	if sprite != null:
		sprite.transform = Transform2D.IDENTITY
	super._refresh_sprite()
	if sprite != null and sprite.visible:
		sprite.transform = PROJECTION * sprite.transform
