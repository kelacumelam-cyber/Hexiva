extends Control
class_name BoltView

signal pressed(index: int)

var bolt_index := -1
var capacity := 4
var nuts: Array[int] = []
var selected := false
var locked := false
var completed := false
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
	custom_minimum_size = Vector2(86.0, 132.0 + float(capacity) * 13.0)
	mouse_filter = Control.MOUSE_FILTER_STOP
	queue_redraw()

func flash_error() -> void:
	modulate = Color(1.0, 0.58, 0.58, 1.0)
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
	if event is InputEventMouseButton and event.button_index == MOUSE_BUTTON_LEFT and event.pressed:
		pressed.emit(bolt_index)
		accept_event()
	elif event is InputEventScreenTouch and event.pressed:
		pressed.emit(bolt_index)
		accept_event()

func _draw() -> void:
	var width: float = size.x
	var height: float = size.y
	var center_x: float = width * 0.5
	var base_y: float = height - 18.0
	var rod_top: float = 20.0
	var rod_width: float = 15.0

	# Selection glow.
	if selected:
		draw_circle(Vector2(center_x, height * 0.54), width * 0.48, Color(0.98, 0.72, 0.18, 0.16))
		draw_rect(Rect2(3, 3, width - 6, height - 6), Color(0.98, 0.72, 0.18, 0.82), false, 2.0)

	# Bolt base shadow + flange.
	draw_colored_polygon(PackedVector2Array([
		Vector2(11, base_y + 5), Vector2(center_x, base_y + 14),
		Vector2(width - 11, base_y + 5), Vector2(center_x, base_y - 3)
	]), Color(0.055, 0.07, 0.11, 0.85))
	draw_colored_polygon(PackedVector2Array([
		Vector2(9, base_y), Vector2(center_x, base_y + 10),
		Vector2(width - 9, base_y), Vector2(center_x, base_y - 9)
	]), Color(0.67, 0.72, 0.79, 1.0))

	# Threaded metal rod. Drawn natively to avoid WebView/SVG artifacts.
	draw_rect(Rect2(center_x - rod_width * 0.5, rod_top, rod_width, base_y - rod_top), Color(0.56, 0.62, 0.70, 1.0))
	draw_rect(Rect2(center_x - 2.0, rod_top, 4.0, base_y - rod_top), Color(0.93, 0.96, 1.0, 0.80))
	var thread_y: float = rod_top + 5.0
	while thread_y < base_y - 2.0:
		draw_line(Vector2(center_x - rod_width * 0.5, thread_y), Vector2(center_x + rod_width * 0.5, thread_y + 3.0), Color(0.22, 0.27, 0.35, 0.75), 1.0)
		thread_y += 7.0
	draw_circle(Vector2(center_x, rod_top), rod_width * 0.5, Color(0.85, 0.89, 0.94, 1.0))

	var nut_height: float = 24.0
	if capacity == 3:
		nut_height = 31.0
	elif capacity == 5:
		nut_height = 20.0

	for i in range(nuts.size()):
		var color_index: int = nuts[i] % maxi(1, palette.size())
		var color: Color = palette[color_index] if not palette.is_empty() else Color.CORNFLOWER_BLUE
		var y_bottom: float = base_y - 5.0 - float(i) * nut_height
		var y_top: float = y_bottom - nut_height + 3.0
		var left: float = 8.0
		var right: float = width - 8.0
		var chamfer: float = 11.0
		var points: PackedVector2Array = PackedVector2Array([
			Vector2(left + chamfer, y_top),
			Vector2(right - chamfer, y_top),
			Vector2(right, y_top + 6.0),
			Vector2(right - 5.0, y_bottom),
			Vector2(left + 5.0, y_bottom),
			Vector2(left, y_top + 6.0)
		])
		draw_colored_polygon(points, color.darkened(0.12))
		draw_polyline(PackedVector2Array([
			points[0], points[1], points[2], points[3], points[4], points[5], points[0]
		]), color.lightened(0.34), 1.4, true)
		draw_rect(Rect2(left + 15.0, y_top + 7.0, right - left - 30.0, max(5.0, nut_height - 13.0)), color, true)
		draw_circle(Vector2(center_x, y_top + 6.5), 7.0, Color(0.04, 0.055, 0.09, 1.0))
		draw_arc(Vector2(center_x, y_top + 6.5), 8.4, 0.0, TAU, 24, color.lightened(0.38), 1.2)

	if completed:
		draw_circle(Vector2(width - 10.0, 11.0), 7.0, Color(0.25, 0.95, 0.55, 1.0))
		draw_line(Vector2(width - 13.0, 11.0), Vector2(width - 10.5, 14.0), Color(0.03, 0.15, 0.08), 2.0)
		draw_line(Vector2(width - 10.5, 14.0), Vector2(width - 6.5, 8.5), Color(0.03, 0.15, 0.08), 2.0)

	if locked:
		draw_rect(Rect2(2, 2, width - 4, height - 4), Color(0.08, 0.10, 0.18, 0.58), true)
		var lock_center: Vector2 = Vector2(center_x, height * 0.45)
		draw_arc(lock_center + Vector2(0, -7), 11.0, PI, TAU, 20, Color(0.78, 0.88, 1.0), 4.0)
		draw_rect(Rect2(lock_center.x - 13, lock_center.y - 6, 26, 21), Color(0.47, 0.66, 0.93), true)
		draw_circle(lock_center + Vector2(0, 3), 3.2, Color(0.08, 0.11, 0.19))
