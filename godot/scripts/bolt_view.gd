extends Control
class_name BoltView

signal pressed(index: int)

var bolt_index: int = -1
var capacity: int = 4
var nuts: Array[int] = []
var selected: bool = false
var locked: bool = false
var completed: bool = false
var palette: Array[Color] = []

func setup(index: int, bolt_data: Dictionary, colors: Array[Color], is_selected: bool) -> void:
	bolt_index = index
	capacity = int(bolt_data.get("capacity", 4))
	nuts = []
	for value in bolt_data.get("nuts", []):
		nuts.append(int(value))
	locked = bool(bolt_data.get("locked", false))
	selected = is_selected
	palette = colors
	completed = _is_complete()
	custom_minimum_size = Vector2(96.0, _height_for_capacity())
	mouse_filter = Control.MOUSE_FILTER_STOP
	queue_redraw()

func _height_for_capacity() -> float:
	match capacity:
		3:
			return 206.0
		5:
			return 238.0
		_:
			return 222.0

func flash_error() -> void:
	modulate = Color(1.0, 0.48, 0.56, 1.0)
	var tween: Tween = create_tween()
	tween.tween_property(self, "modulate", Color.WHITE, 0.20)

func _is_complete() -> bool:
	if nuts.size() != capacity or nuts.is_empty():
		return false
	var first: int = nuts[0]
	for value in nuts:
		if value != first:
			return false
	return true

func _gui_input(event: InputEvent) -> void:
	if event is InputEventMouseButton:
		var mouse_event: InputEventMouseButton = event as InputEventMouseButton
		if mouse_event.button_index == MOUSE_BUTTON_LEFT and mouse_event.pressed:
			pressed.emit(bolt_index)
			accept_event()
	elif event is InputEventScreenTouch:
		var touch_event: InputEventScreenTouch = event as InputEventScreenTouch
		if touch_event.pressed:
			pressed.emit(bolt_index)
			accept_event()

func _draw() -> void:
	var width: float = size.x
	var height: float = size.y
	var center_x: float = width * 0.5
	var base_y: float = height - 25.0
	var rod_top: float = 24.0
	var rod_width: float = 18.0

	if completed:
		draw_circle(Vector2(center_x, base_y + 1.0), 39.0, Color(0.22, 0.95, 0.58, 0.10))
		draw_arc(Vector2(center_x, base_y + 1.0), 38.0, 0.0, TAU, 48, Color(0.30, 1.0, 0.66, 0.45), 2.0)

	if selected:
		draw_circle(Vector2(center_x, height * 0.47), 45.0, Color(1.0, 0.73, 0.20, 0.11))
		draw_arc(Vector2(center_x, height * 0.47), 44.0, 0.0, TAU, 48, Color(1.0, 0.72, 0.18, 0.58), 2.0)

	_draw_bolt_base(center_x, base_y, width)
	_draw_rod(center_x, rod_top, base_y, rod_width)

	var nut_height: float = 29.0
	match capacity:
		3:
			nut_height = 35.0
		5:
			nut_height = 24.0

	for i in range(nuts.size()):
		var color_index: int = nuts[i] % maxi(1, palette.size())
		var color: Color = palette[color_index] if not palette.is_empty() else Color.CORNFLOWER_BLUE
		var lift: float = -27.0 if selected and i == nuts.size() - 1 else 0.0
		var y_bottom: float = base_y - 8.0 - float(i) * nut_height + lift
		_draw_nut(center_x, y_bottom, nut_height, color)

	if locked:
		_draw_lock_overlay(center_x, height)

func _draw_bolt_base(center_x: float, base_y: float, width: float) -> void:
	draw_ellipse_shadow(Vector2(center_x, base_y + 13.0), Vector2(35.0, 8.0), Color(0.0, 0.0, 0.0, 0.30))
	draw_colored_polygon(PackedVector2Array([
		Vector2(11.0, base_y + 2.0),
		Vector2(center_x, base_y + 13.0),
		Vector2(width - 11.0, base_y + 2.0),
		Vector2(center_x, base_y - 8.0)
	]), Color("#657082"))
	draw_colored_polygon(PackedVector2Array([
		Vector2(15.0, base_y - 2.0),
		Vector2(center_x, base_y + 7.0),
		Vector2(width - 15.0, base_y - 2.0),
		Vector2(center_x, base_y - 10.0)
	]), Color("#d9e0e8"))
	draw_line(Vector2(19.0, base_y - 3.0), Vector2(center_x, base_y + 5.0), Color(1.0, 1.0, 1.0, 0.72), 1.4)

func _draw_rod(center_x: float, rod_top: float, base_y: float, rod_width: float) -> void:
	draw_rect(Rect2(center_x - rod_width * 0.5, rod_top, rod_width, base_y - rod_top), Color("#7f8998"), true)
	draw_rect(Rect2(center_x - 3.0, rod_top, 5.0, base_y - rod_top), Color(0.93, 0.96, 1.0, 0.78), true)
	var thread_y: float = rod_top + 4.0
	while thread_y < base_y - 4.0:
		draw_line(
			Vector2(center_x - rod_width * 0.5, thread_y),
			Vector2(center_x + rod_width * 0.5, thread_y + 4.0),
			Color(0.16, 0.20, 0.29, 0.72),
			1.4
		)
		thread_y += 7.0
	draw_circle(Vector2(center_x, rod_top), rod_width * 0.5, Color("#edf2f7"))
	draw_arc(Vector2(center_x, rod_top), rod_width * 0.5, 0.0, TAU, 24, Color("#8893a4"), 1.0)

func _draw_nut(center_x: float, bottom_y: float, nut_height: float, color: Color) -> void:
	var outer_half: float = 34.0
	var inner_half: float = 17.0
	var top_y: float = bottom_y - nut_height
	var chamfer_y: float = top_y + 8.0
	var bottom_chamfer: float = bottom_y - 6.0
	var hole_y: float = top_y + 4.0

	draw_ellipse_shadow(Vector2(center_x, bottom_y + 4.0), Vector2(29.0, 5.0), Color(0.0, 0.0, 0.0, 0.20))

	var left_face: PackedVector2Array = PackedVector2Array([
		Vector2(center_x - outer_half, top_y + 1.0),
		Vector2(center_x - inner_half, chamfer_y),
		Vector2(center_x - inner_half, bottom_chamfer),
		Vector2(center_x - outer_half + 6.0, bottom_y - 7.0)
	])
	draw_colored_polygon(left_face, color.darkened(0.28))

	var front_face: PackedVector2Array = PackedVector2Array([
		Vector2(center_x - inner_half, chamfer_y),
		Vector2(center_x + inner_half, chamfer_y),
		Vector2(center_x + inner_half, bottom_chamfer),
		Vector2(center_x - inner_half, bottom_chamfer)
	])
	draw_colored_polygon(front_face, color.darkened(0.08))

	var right_face: PackedVector2Array = PackedVector2Array([
		Vector2(center_x + inner_half, chamfer_y),
		Vector2(center_x + outer_half, top_y + 1.0),
		Vector2(center_x + outer_half - 6.0, bottom_y - 7.0),
		Vector2(center_x + inner_half, bottom_chamfer)
	])
	draw_colored_polygon(right_face, color.darkened(0.38))

	var top_face: PackedVector2Array = PackedVector2Array([
		Vector2(center_x - outer_half, top_y + 1.0),
		Vector2(center_x - inner_half, top_y - 8.0),
		Vector2(center_x + inner_half, top_y - 8.0),
		Vector2(center_x + outer_half, top_y + 1.0),
		Vector2(center_x + inner_half, chamfer_y),
		Vector2(center_x - inner_half, chamfer_y)
	])
	draw_colored_polygon(top_face, color.lightened(0.10))
	draw_polyline(PackedVector2Array([
		top_face[0], top_face[1], top_face[2], top_face[3], top_face[4], top_face[5], top_face[0]
	]), color.lightened(0.38), 1.1, true)

	draw_circle(Vector2(center_x, hole_y), 9.0, Color("#07091a"))
	draw_arc(Vector2(center_x, hole_y), 10.4, 0.0, TAU, 28, color.darkened(0.34), 2.0)
	draw_line(
		Vector2(center_x - inner_half + 4.0, chamfer_y + 2.0),
		Vector2(center_x - inner_half + 4.0, bottom_chamfer - 2.0),
		color.lightened(0.40),
		1.5
	)

func _draw_lock_overlay(center_x: float, height: float) -> void:
	draw_rect(Rect2(2.0, 2.0, size.x - 4.0, height - 4.0), Color(0.03, 0.04, 0.12, 0.58), true)
	var lock_center: Vector2 = Vector2(center_x, height * 0.46)
	draw_arc(lock_center + Vector2(0, -8), 12.0, PI, TAU, 24, Color("#dce8ff"), 4.0)
	draw_rect(Rect2(lock_center.x - 15.0, lock_center.y - 6.0, 30.0, 24.0), Color("#6b8fe8"), true)
	draw_circle(lock_center + Vector2(0, 4), 3.5, Color("#11162b"))

func draw_ellipse_shadow(center: Vector2, radii: Vector2, color: Color) -> void:
	var points: PackedVector2Array = PackedVector2Array()
	for i in range(32):
		var angle: float = TAU * float(i) / 32.0
		points.append(center + Vector2(cos(angle) * radii.x, sin(angle) * radii.y))
	draw_colored_polygon(points, color)
