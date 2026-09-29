extends Control
class_name GameBackground

func _ready() -> void:
	mouse_filter = Control.MOUSE_FILTER_IGNORE
	queue_redraw()

func _notification(what: int) -> void:
	if what == NOTIFICATION_RESIZED:
		queue_redraw()

func _draw() -> void:
	var rect: Rect2 = Rect2(Vector2.ZERO, size)
	draw_rect(rect, Color("#0d0a27"), true)

	# Layered radial glow approximation from the HTML reference.
	_draw_soft_glow(Vector2(size.x * 0.50, size.y * 0.10), min(size.x, size.y) * 0.48, Color(0.50, 0.55, 0.97, 0.18))
	_draw_soft_glow(Vector2(size.x * 0.15, size.y * 0.55), min(size.x, size.y) * 0.34, Color(0.93, 0.28, 0.58, 0.10))
	_draw_soft_glow(Vector2(size.x * 0.85, size.y * 0.65), min(size.x, size.y) * 0.34, Color(0.22, 0.74, 0.97, 0.11))
	_draw_soft_glow(Vector2(size.x * 0.50, size.y * 0.90), min(size.x, size.y) * 0.44, Color(0.39, 0.40, 0.95, 0.12))

	# Subtle dotted / hex-like texture.
	var spacing: float = 28.0
	var y: float = 0.0
	var row: int = 0
	while y <= size.y:
		var offset: float = 14.0 if row % 2 == 1 else 0.0
		var x: float = offset
		while x <= size.x:
			draw_circle(Vector2(x, y), 1.15, Color(1.0, 1.0, 1.0, 0.045))
			x += spacing
		y += spacing
		row += 1

func _draw_soft_glow(center: Vector2, radius: float, color: Color) -> void:
	var steps: int = 10
	for i in range(steps, 0, -1):
		var t: float = float(i) / float(steps)
		var c: Color = color
		c.a *= (1.0 - t) * 0.7 + 0.06
		draw_circle(center, radius * t, c)
