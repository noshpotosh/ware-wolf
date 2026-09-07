@tool
class_name OfficeRoomShell
extends Node2D

const HALF_TILE := Vector2(64, 32)
const MIN_ROOM_SIZE := Vector2i(2, 2)
const MAX_ROOM_SIZE := Vector2i(16, 16)
const FLOOR_THICKNESS := 20.0
const TRIM_HEIGHT := 10.0
const MATERIAL_SIZE := 128.0
const CAP_GRAIN_DEPTH_UV := 0.12
const FLOOR_REPEAT_CELLS := 2.0
const PLASTER_WASH_OPACITY := 0.65
const WOOD := Color("62452e")
const WOOD_LIGHT := Color("aa7b49")

@export var room_size := Vector2i(7, 4):
	set(value):
		room_size = value.clamp(MIN_ROOM_SIZE, MAX_ROOM_SIZE)
		queue_redraw()
@export_range(64, 320, 1) var wall_height := 170.0:
	set(value):
		wall_height = value
		queue_redraw()
@export_range(0, 40, 1) var wall_thickness := 14.0:
	set(value):
		wall_thickness = value
		queue_redraw()
# Optional clockwise floor boundary in grid cells, starting at the back corner.
# The first and last edges meet the two full-height rear walls.
@export var floor_outline := PackedVector2Array():
	set(value):
		floor_outline = value
		queue_redraw()
@export var floor_texture: Texture2D:
	set(value):
		_watch_texture(floor_texture, value)
		floor_texture = value
		queue_redraw()
@export var wall_texture: Texture2D:
	set(value):
		_watch_texture(wall_texture, value)
		wall_texture = value
		queue_redraw()
@export var show_grid := false:
	set(value):
		show_grid = value
		queue_redraw()


func _watch_texture(previous: Texture2D, next: Texture2D) -> void:
	var shared_by_both := (
		previous == floor_texture and previous == wall_texture
	)
	var disconnect_previous := (
		previous != null and not shared_by_both
		and previous.changed.is_connected(queue_redraw)
	)
	if disconnect_previous:
		previous.changed.disconnect(queue_redraw)
	if next != null and not next.changed.is_connected(queue_redraw):
		next.changed.connect(queue_redraw)


static func project(cell: Vector2) -> Vector2:
	return Vector2(cell.x - cell.y, cell.x + cell.y) * HALF_TILE


static func unproject(point: Vector2) -> Vector2:
	var diamond := point / HALF_TILE
	return Vector2(diamond.x + diamond.y, diamond.y - diamond.x) / 2


func _ready() -> void:
	texture_filter = CanvasItem.TEXTURE_FILTER_NEAREST
	texture_repeat = CanvasItem.TEXTURE_REPEAT_ENABLED


func _draw() -> void:
	var north := Vector2.ZERO
	var east := project(Vector2(room_size.x, 0))
	var south := project(Vector2(room_size))
	var west := project(Vector2(0, room_size.y))
	var boundary := PackedVector2Array([north, east, south, west])
	if floor_outline.size() >= 3:
		boundary.clear()
		for cell in floor_outline:
			boundary.append(project(cell))
	_draw_floor(boundary)
	for index in range(1, boundary.size() - 1):
		var start := boundary[index]
		var end := boundary[index + 1]
		var tint := WOOD if end.x > start.x else WOOD.darkened(0.15)
		_draw_edge(start, end, tint)
	_draw_wall(west, north, Color("c8b797"))
	_draw_wall(north, east, Color("f0d9af"))
	_draw_wall_depth(west, north, Vector2(-1, -0.5))
	_draw_wall_depth(north, east, Vector2(1, -0.5))
	_draw_corner_cap(north)
	if show_grid:
		_draw_grid()


func _draw_floor(points: PackedVector2Array) -> void:
	var uv := PackedVector2Array()
	for point in points:
		uv.append(unproject(point) / FLOOR_REPEAT_CELLS)
	draw_colored_polygon(points, Color.WHITE, uv, floor_texture)


func _draw_edge(start: Vector2, end: Vector2, color: Color) -> void:
	var drop := Vector2(0, FLOOR_THICKNESS)
	var points := PackedVector2Array([start, end, end + drop, start + drop])
	var length_uv := absf(end.x - start.x) / MATERIAL_SIZE
	var depth_uv := FLOOR_THICKNESS / MATERIAL_SIZE
	var uv := PackedVector2Array([
		Vector2.ZERO, Vector2(length_uv, 0),
		Vector2(length_uv, depth_uv), Vector2(0, depth_uv),
	])
	draw_colored_polygon(points, color.lightened(0.15), uv, floor_texture)
	draw_line(start, end, WOOD_LIGHT, 2)


func _draw_wall(start: Vector2, end: Vector2, tint: Color) -> void:
	var rise := Vector2(0, wall_height)
	var points := PackedVector2Array([start - rise, end - rise, end, start])
	var wall_width := absf(end.x - start.x)
	var uv := PackedVector2Array([
		Vector2.ZERO, Vector2(wall_width / MATERIAL_SIZE, 0),
		Vector2(wall_width, wall_height) / MATERIAL_SIZE,
		Vector2(0, wall_height / MATERIAL_SIZE),
	])
	draw_colored_polygon(points, tint, uv, wall_texture)
	var wash := Color(tint, PLASTER_WASH_OPACITY)
	draw_colored_polygon(points, wash)
	_draw_trim(start, end)
	_draw_trim(start - rise, end - rise)


func _draw_trim(start: Vector2, end: Vector2) -> void:
	var trim := Vector2(0, TRIM_HEIGHT)
	draw_colored_polygon(
		PackedVector2Array([start, end, end + trim, start + trim]), WOOD
	)
	draw_line(start, end, WOOD_LIGHT, 2)


func _draw_grid() -> void:
	var guide := Color(1, 0.85, 0.5, 0.4)
	for column in range(room_size.x + 1):
		_draw_grid_line(Vector2(column, 0),
			Vector2(column, room_size.y), guide)
	for row in range(room_size.y + 1):
		_draw_grid_line(Vector2(0, row),
			Vector2(room_size.x, row), guide)


func _draw_wall_depth(start: Vector2, end: Vector2, outward: Vector2) -> void:
	var rise := Vector2(0, wall_height)
	var thickness := outward * wall_thickness
	var top_start := start - rise
	var top_end := end - rise
	var cap := PackedVector2Array([
		top_start, top_end, top_end + thickness, top_start + thickness,
	])
	var cap_uv := PackedVector2Array([
		Vector2.ZERO, Vector2(absf(end.x - start.x) / MATERIAL_SIZE, 0),
		Vector2(absf(end.x - start.x) / MATERIAL_SIZE, CAP_GRAIN_DEPTH_UV),
		Vector2(0, CAP_GRAIN_DEPTH_UV),
	])
	draw_colored_polygon(cap, Color("cba779"), cap_uv, floor_texture)
	draw_line(top_start + thickness, top_end + thickness, WOOD_LIGHT, 2)
	var tip := start if outward.x < 0 else end
	_draw_wall_end(tip, thickness)


func _draw_wall_end(tip: Vector2, thickness: Vector2) -> void:
	var top := tip - Vector2(0, wall_height)
	var points := PackedVector2Array([top, tip, tip + thickness, top + thickness])
	draw_colored_polygon(points, Color("aa9371"))
	var base := Vector2(0, TRIM_HEIGHT)
	draw_colored_polygon(PackedVector2Array([
		tip - base, tip, tip + thickness, tip + thickness - base,
	]), WOOD)
	draw_line(top, tip - base, Color("dbc6a2"), 1)


func _draw_corner_cap(north: Vector2) -> void:
	var top := north - Vector2(0, wall_height)
	var left := Vector2(-1, -0.5) * wall_thickness
	var right := Vector2(1, -0.5) * wall_thickness
	draw_colored_polygon(PackedVector2Array([
		top, top + left, top + left + right, top + right,
	]), Color("997343"))


func _draw_grid_line(start: Vector2, end: Vector2, color: Color) -> void:
	if floor_outline.size() < 3:
		draw_line(project(start), project(end), color)
		return
	var segments := Geometry2D.intersect_polyline_with_polygon(
		PackedVector2Array([start, end]), floor_outline)
	for segment in segments:
		var points := PackedVector2Array()
		for cell in segment:
			points.append(project(cell))
		draw_polyline(points, color)
