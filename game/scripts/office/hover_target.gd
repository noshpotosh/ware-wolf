class_name HoverTarget
extends Node

signal hover_changed(active: bool)
signal clicked

const OUTLINE := preload("res://shaders/office_hover.gdshader")
const GROUP := &"office_hover_targets"

@export var sprite_path: NodePath = ^"../Sprite"

var sprite: Sprite2D
var hovered := false
var _texture: Texture2D
var _image: Image
var _outline: ShaderMaterial
var _original_material: Material
var _original_parent_material := false


func _ready() -> void:
	sprite = get_node_or_null(sprite_path) as Sprite2D
	add_to_group(GROUP)
	if sprite != null:
		sprite.texture_filter = CanvasItem.TEXTURE_FILTER_NEAREST


func contains_world_point(world: Vector2) -> bool:
	if not is_instance_valid(sprite) or not sprite.is_visible_in_tree():
		return false
	if is_zero_approx(sprite.global_transform.determinant()):
		return false
	_cache_image()
	if _image == null or _image.is_empty():
		return false

	var rect := sprite.get_rect()
	var local := sprite.to_local(world)
	if not rect.has_point(local):
		return false
	var uv := (local - rect.position) / rect.size
	if sprite.flip_h:
		uv.x = 1.0 - uv.x
	if sprite.flip_v:
		uv.y = 1.0 - uv.y
	var source := _source_rect()
	var pixel := Vector2i((source.position + uv * source.size).floor())
	pixel = pixel.clamp(Vector2i(source.position),
		Vector2i(source.end) - Vector2i.ONE)
	if not Rect2i(Vector2i.ZERO, _image.get_size()).has_point(pixel):
		return false
	return _image.get_pixelv(pixel).a > 0.0


func set_hovered(active: bool) -> void:
	if hovered == active:
		return
	if active and (not is_instance_valid(sprite) or sprite.texture == null):
		return
	hovered = active
	if is_instance_valid(sprite):
		if active:
			_apply_outline()
		else:
			sprite.material = _original_material
			sprite.use_parent_material = _original_parent_material
	hover_changed.emit(active)


func _cache_image() -> void:
	if _texture == sprite.texture and _image != null:
		return
	if _texture != null and _texture.changed.is_connected(_invalidate_image):
		_texture.changed.disconnect(_invalidate_image)
	_texture = sprite.texture
	_image = null
	if _texture == null:
		return
	_texture.changed.connect(_invalidate_image)
	_image = _texture.get_image()
	if _image != null and _image.is_compressed():
		_image.decompress()


func _invalidate_image() -> void:
	_image = null


func _source_rect() -> Rect2:
	var source := Rect2(Vector2.ZERO, sprite.texture.get_size())
	if sprite.region_enabled:
		source = sprite.region_rect
	source.size /= Vector2(sprite.hframes, sprite.vframes)
	source.position += Vector2(sprite.frame_coords) * source.size
	return source


func _apply_outline() -> void:
	_cache_image()
	_original_material = sprite.material
	_original_parent_material = sprite.use_parent_material
	_outline = ShaderMaterial.new()
	_outline.shader = OUTLINE
	var rect := sprite.get_rect()
	var source := _source_rect()
	_outline.set_shader_parameter("sprite_rect",
		Vector4(rect.position.x, rect.position.y, rect.size.x, rect.size.y))
	_outline.set_shader_parameter("source_rect", Vector4(
		source.position.x, source.position.y, source.size.x, source.size.y))
	_outline.set_shader_parameter("flip", Vector2(
		-1.0 if sprite.flip_h else 1.0, -1.0 if sprite.flip_v else 1.0))
	if _image != null:
		_outline.set_shader_parameter("art", ImageTexture.create_from_image(
			_image))
	sprite.use_parent_material = false
	sprite.material = _outline


func _exit_tree() -> void:
	set_hovered(false)
	if _texture != null and _texture.changed.is_connected(_invalidate_image):
		_texture.changed.disconnect(_invalidate_image)
