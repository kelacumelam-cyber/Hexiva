extends Control
class_name BoltView

signal pressed(index: int)

var bolt_index: int = -1
var capacity: int = 4
var nuts: Array[int] = []
var selected: bool = false
var locked: bool = false
var completed: bool = false
var nut_styles: Array[Dictionary] = []
var float_phase: float = 0.0

func setup(index: int, bolt_data: Dictionary, styles: Array[Dictionary], is_selected: bool) -> void:
	bolt_index = index
	capacity = int(bolt_data.get("capacity", 4))
	nuts = []
	for value in bolt_data.get("nuts", []):
		nuts.append(int(value))
	locked = bool(bolt_data.get("locked", false))
	selected = is_selected
	nut_styles = styles
	completed = _is_complete()
	custom_minimum_size = Vector2(84.0, _height_for_capacity())
	mouse_filter = Control.MOUSE_FILTER_STOP
	set_process(selected)
	queue_redraw()

func _height_for_capacity() -> float:
	match capacity:
		3:
			return 185.0
		5:
			return 215.0
		_:
			return 200.0

func _process(delta: float) -> void:
	if not selected:
		return
	float_phase += delta * 5.0
	queue_redraw()

func flash_error() -> void:
	modulate = Color(1.0, 0.46, 0.54, 1.0)
	var tween: Tween = create_tween()
	tween.tween_property(self, "modulate", Color.WHITE, 0.22)

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
	var svg_width: float = 84.0
	var width: float = size.x
	var x_offset: float = (width - svg_width) * 0.5
	var cx: float = x_offset + 42.0
	var height: float = size.y
	var base_y: float = height - 20.0
	var nut_height: float = 27.0
	if capacity == 3:
		nut_height = 32.0
	elif capacity == 5:
		nut_height = 23.0
	var rod_top_y: float = base_y - float(capacity) * nut_height - 22.0
	var rod_width: float = 23.0

	if selected:
		draw_style_box(_selection_style(), Rect2(x_offset + 2.0, 3.0, 80.0, height - 8.0))
	if completed:
		draw_circle(Vector2(cx, base_y + 5.0), 34.0, Color(0.20, 0.95, 0.55, 0.08))

	_draw_base(cx, base_y)
	_draw_rod(cx, rod_top_y, base_y, rod_width)

	var nut_count: int = nuts.size()
	var lifted_index: int = nut_count - 1 if selected and nut_count > 0 else -1
	var stationary_count: int = nut_count - 1 if lifted_index >= 0 else nut_count

	for i in range(stationary_count):
		var bottom_y: float = base_y - float(i) * nut_height
		_draw_nut(nuts[i], cx, bottom_y, nut_height, false)

	if lifted_index >= 0:
		var float_offset: float = sin(float_phase) * 4.0
		var lifted_bottom_y: float = rod_top_y - 14.0 + float_offset
		_draw_nut(nuts[lifted_index], cx, lifted_bottom_y, nut_height, true)

	if locked:
		_draw_lock_overlay(cx, height)

func _selection_style() -> StyleBoxFlat:
	var style: StyleBoxFlat = StyleBoxFlat.new()
	style.bg_color = Color(0.98, 0.74, 0.20, 0.08)
	style.border_color = Color(0.98, 0.74, 0.20, 0.92)
	style.border_width_left = 2
	style.border_width_top = 2
	style.border_width_right = 2
	style.border_width_bottom = 2
	style.corner_radius_top_left = 14
	style.corner_radius_top_right = 14
	style.corner_radius_bottom_left = 14
	style.corner_radius_bottom_right = 14
	return style

func _draw_base(cx: float, base_y: float) -> void:
	draw_colored_polygon(PackedVector2Array([
		Vector2(cx - 34.0, base_y),
		Vector2(cx, base_y + 10.0),
		Vector2(cx + 34.0, base_y),
		Vector2(cx + 34.0, base_y + 10.0),
		Vector2(cx, base_y + 20.0),
		Vector2(cx - 34.0, base_y + 10.0)
	]), Color("#0f172a"))
	draw_colored_polygon(PackedVector2Array([
		Vector2(cx - 34.0, base_y),
		Vector2(cx, base_y + 10.0),
		Vector2(cx + 34.0, base_y),
		Vector2(cx + 34.0, base_y + 7.0),
		Vector2(cx, base_y + 17.0),
		Vector2(cx - 34.0, base_y + 7.0)
	]), Color("#8793a5"))
	draw_colored_polygon(PackedVector2Array([
		Vector2(cx, base_y - 7.0),
		Vector2(cx + 34.0, base_y),
		Vector2(cx, base_y + 10.0),
		Vector2(cx - 34.0, base_y)
	]), Color("#cbd5e1"))
	draw_polyline(PackedVector2Array([
		Vector2(cx, base_y - 7.0), Vector2(cx + 34.0, base_y),
		Vector2(cx, base_y + 10.0), Vector2(cx - 34.0, base_y),
		Vector2(cx, base_y - 7.0)
	]), Color("#f8fafc"), 1.2)

func _draw_rod(cx: float, rod_top_y: float, base_y: float, rod_width: float) -> void:
	var rod_height: float = maxf(8.0, base_y - rod_top_y)
	var left: float = cx - rod_width * 0.5
	draw_rect(Rect2(left, rod_top_y, rod_width, rod_height), Color("#94a3b8"), true)
	draw_rect(Rect2(left + 4.5, rod_top_y, 5.5, rod_height), Color("#f8fafc"), true)
	draw_rect(Rect2(left + 16.0, rod_top_y, 5.0, rod_height), Color("#334155"), true)
	var y: float = rod_top_y + 1.5
	while y < base_y:
		draw_colored_polygon(PackedVector2Array([
			Vector2(left, y),
			Vector2(left + rod_width * 0.5, y - 1.5),
			Vector2(left + rod_width, y + 1.0),
			Vector2(left + rod_width, y + 4.0),
			Vector2(left + rod_width * 0.5, y + 1.5),
			Vector2(left, y + 2.5)
		]), Color(0.58, 0.64, 0.72, 0.84))
		draw_line(Vector2(left, y), Vector2(left + rod_width, y + 1.0), Color(1.0, 1.0, 1.0, 0.78), 0.8)
		y += 6.5
	_draw_custom_ellipse(Vector2(cx, rod_top_y), Vector2(rod_width * 0.5, 4.5), Color("#f8fafc"))
	_draw_custom_ellipse(Vector2(cx, rod_top_y), Vector2(rod_width * 0.5 - 2.0, 2.2), Color("#cbd5e1"))
	draw_line(Vector2(cx - 4.0, rod_top_y), Vector2(cx + 4.0, rod_top_y), Color("#64748b"), 1.2)

func _draw_nut(color_id: int, cx: float, bottom_y: float, h: float, floating: bool) -> void:
	if nut_styles.is_empty():
		return
	var style: Dictionary = nut_styles[color_id % nut_styles.size()]
	var top_color: Color = style["top"]
	var top_high: Color = style["top_high"]
	var front: Color = style["front"]
	var front_high: Color = style["front_high"]
	var left_color: Color = style["left"]
	var right_color: Color = style["right"]
	var hole_color: Color = style["hole"]

	var top_center_y: float = bottom_y - h
	var half_w: float = 33.0
	var mid_w: float = 16.5
	var x_left: float = cx - half_w
	var x_mid_left: float = cx - mid_w
	var x_mid_right: float = cx + mid_w
	var x_right: float = cx + half_w
	var y_top_chamfer: float = top_center_y + 7.0
	var y_bottom_chamfer: float = bottom_y - 5.0

	if floating:
		_draw_custom_ellipse(Vector2(cx, bottom_y - 2.0), Vector2(11.5, 5.2), hole_color)

	var top_face: PackedVector2Array = PackedVector2Array([
		Vector2(x_left, top_center_y),
		Vector2(x_mid_left, top_center_y - 8.0),
		Vector2(x_mid_right, top_center_y - 8.0),
		Vector2(x_right, top_center_y),
		Vector2(x_mid_right, y_top_chamfer),
		Vector2(x_mid_left, y_top_chamfer)
	])
	draw_colored_polygon(top_face, top_color)
	draw_polyline(PackedVector2Array([
		top_face[0], top_face[1], top_face[2], top_face[3], top_face[4], top_face[5], top_face[0]
	]), top_high, 0.9, true)

	var left_face: PackedVector2Array = PackedVector2Array([
		Vector2(x_left, top_center_y),
		Vector2(x_mid_left, y_top_chamfer),
		Vector2(x_mid_left, y_bottom_chamfer),
		Vector2(x_left, bottom_y - 8.0)
	])
	draw_colored_polygon(left_face, left_color)

	var front_face: PackedVector2Array = PackedVector2Array([
		Vector2(x_mid_left, y_top_chamfer),
		Vector2(x_mid_right, y_top_chamfer),
		Vector2(x_mid_right, y_bottom_chamfer),
		Vector2(x_mid_left, y_bottom_chamfer)
	])
	draw_colored_polygon(front_face, front)
	draw_line(
		Vector2(x_mid_left + 3.5, y_top_chamfer + 1.0),
		Vector2(x_mid_left + 3.5, y_bottom_chamfer - 1.0),
		front_high,
		1.8
	)

	var right_face: PackedVector2Array = PackedVector2Array([
		Vector2(x_mid_right, y_top_chamfer),
		Vector2(x_right, top_center_y),
		Vector2(x_right, bottom_y - 8.0),
		Vector2(x_mid_right, y_bottom_chamfer)
	])
	draw_colored_polygon(right_face, right_color)

	draw_colored_polygon(PackedVector2Array([
		Vector2(x_left, bottom_y - 8.0),
		Vector2(x_mid_left, y_bottom_chamfer),
		Vector2(x_mid_right, y_bottom_chamfer),
		Vector2(x_right, bottom_y - 8.0),
		Vector2(cx + 12.0, bottom_y),
		Vector2(cx - 12.0, bottom_y)
	]), right_color)

	_draw_custom_ellipse(Vector2(cx, top_center_y), Vector2(11.5, 5.2), hole_color)
	draw_arc(Vector2(cx, top_center_y), 11.0, 0.0, TAU, 32, right_color, 1.4)

func _draw_lock_overlay(cx: float, height: float) -> void:
	draw_rect(Rect2(2.0, 2.0, size.x - 4.0, height - 4.0), Color(0.10, 0.13, 0.22, 0.56), true)
	var lock_center: Vector2 = Vector2(cx, height * 0.48)
	draw_arc(lock_center + Vector2(0, -8), 12.0, PI, TAU, 24, Color("#dbeafe"), 4.0)
	draw_rect(Rect2(lock_center.x - 15.0, lock_center.y - 6.0, 30.0, 24.0), Color("#60a5fa"), true)
	draw_circle(lock_center + Vector2(0, 4), 3.5, Color("#0f172a"))

func _draw_custom_ellipse(center: Vector2, radii: Vector2, color: Color) -> void:
	var points: PackedVector2Array = PackedVector2Array()
	for i in range(36):
		var angle: float = TAU * float(i) / 36.0
		points.append(center + Vector2(cos(angle) * radii.x, sin(angle) * radii.y))
	draw_colored_polygon(points, color)
