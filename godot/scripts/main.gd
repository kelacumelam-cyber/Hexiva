extends Control

const BoltViewScene = preload("res://godot/scripts/bolt_view.gd")

const PALETTE: Array[Color] = [
	Color("#35bdf2"), Color("#24d18f"), Color("#ffd028"), Color("#ff4967"),
	Color("#f44fa0"), Color("#ae62ff"), Color("#19d8dc"), Color("#ff8a2b"),
	Color("#a8df42"), Color("#6d7cff")
]

const LEVEL_PROFILES := [
	{"title":"Mini Atolye", "caps":[3,3,3], "empties":[3], "scramble":26, "locked_spare":false},
	{"title":"Dar Alan", "caps":[3,3,3,3], "empties":[3], "scramble":36, "locked_spare":false},
	{"title":"Boy Farki", "caps":[3,3,4,4], "empties":[4,3], "scramble":46, "locked_spare":false},
	{"title":"Orta Civatalar", "caps":[4,4,4,4], "empties":[4], "scramble":52, "locked_spare":false},
	{"title":"Kucuk-Orta-Buyuk", "caps":[3,4,4,5], "empties":[5,4], "scramble":62, "locked_spare":false},
	{"title":"Kilitli Yedek", "caps":[4,4,4,4,4], "empties":[4], "scramble":72, "locked_spare":true},
	{"title":"Karipik Boylar", "caps":[3,3,4,4,5], "empties":[5,4], "scramble":82, "locked_spare":false},
	{"title":"Uzun Civatalar", "caps":[5,5,5,5], "empties":[5,5], "scramble":88, "locked_spare":false},
	{"title":"Uclu Karma", "caps":[3,4,5,3,4,5], "empties":[5,4], "scramble":102, "locked_spare":false},
	{"title":"Kalabalik Masa", "caps":[4,4,4,4,4,4], "empties":[4,4], "scramble":112, "locked_spare":false},
	{"title":"Kilit ve Boy", "caps":[3,3,5,5,4,4], "empties":[5], "scramble":126, "locked_spare":true},
	{"title":"Usta Uzunluk", "caps":[5,5,5,5,5,5], "empties":[5,5], "scramble":140, "locked_spare":false}
]

var current_level := 1
var bolts: Array = []
var selected_bolt := -1
var move_count := 0
var history: Array = []
var won := false

var title_label: Label
var level_label: Label
var profile_label: Label
var moves_label: Label
var status_label: Label
var board_grid: GridContainer
var next_button: Button

func _ready() -> void:
	_build_ui()
	_load_level(1)

func _build_ui() -> void:
	var background := ColorRect.new()
	background.color = Color("#0d0a27")
	background.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	background.mouse_filter = Control.MOUSE_FILTER_IGNORE
	add_child(background)

	var margin := MarginContainer.new()
	margin.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	margin.add_theme_constant_override("margin_left", 12)
	margin.add_theme_constant_override("margin_right", 12)
	margin.add_theme_constant_override("margin_top", 12)
	margin.add_theme_constant_override("margin_bottom", 12)
	add_child(margin)

	var root_box := VBoxContainer.new()
	root_box.add_theme_constant_override("separation", 8)
	margin.add_child(root_box)

	var top_row := HBoxContainer.new()
	top_row.add_theme_constant_override("separation", 8)
	root_box.add_child(top_row)

	var restart_button := Button.new()
	restart_button.text = "Yeniden"
	restart_button.pressed.connect(_restart_level)
	top_row.add_child(restart_button)

	title_label = Label.new()
	title_label.text = "HEXA NUT SORT"
	title_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	title_label.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	title_label.add_theme_font_size_override("font_size", 23)
	top_row.add_child(title_label)

	var undo_button := Button.new()
	undo_button.text = "Geri Al"
	undo_button.pressed.connect(_undo)
	top_row.add_child(undo_button)

	var info_box := VBoxContainer.new()
	info_box.add_theme_constant_override("separation", 2)
	root_box.add_child(info_box)

	level_label = Label.new()
	level_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	level_label.add_theme_font_size_override("font_size", 18)
	info_box.add_child(level_label)

	profile_label = Label.new()
	profile_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	profile_label.add_theme_color_override("font_color", Color("#b8c1ff"))
	profile_label.add_theme_font_size_override("font_size", 13)
	info_box.add_child(profile_label)

	moves_label = Label.new()
	moves_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	moves_label.add_theme_color_override("font_color", Color("#ffd45a"))
	info_box.add_child(moves_label)

	var board_center := CenterContainer.new()
	board_center.size_flags_vertical = Control.SIZE_EXPAND_FILL
	root_box.add_child(board_center)

	board_grid = GridContainer.new()
	board_grid.columns = 4
	board_grid.add_theme_constant_override("h_separation", 6)
	board_grid.add_theme_constant_override("v_separation", 8)
	board_center.add_child(board_grid)

	status_label = Label.new()
	status_label.text = ""
	status_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	status_label.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	status_label.custom_minimum_size = Vector2(0, 40)
	status_label.add_theme_font_size_override("font_size", 13)
	root_box.add_child(status_label)

	next_button = Button.new()
	next_button.text = "Sonraki Bolum"
	next_button.visible = false
	next_button.pressed.connect(_next_level)
	root_box.add_child(next_button)

func _load_level(level_number: int) -> void:
	current_level = max(1, level_number)
	selected_bolt = -1
	move_count = 0
	history.clear()
	won = false
	next_button.visible = false
	bolts = _generate_level(current_level)
	_refresh_board()
	_set_status("Ayni renkteki somunlari ayni civatada topla.", Color("#c7d2fe"))

func _profile_for_level(level_number: int) -> Dictionary:
	var index := (level_number - 1) % LEVEL_PROFILES.size()
	var profile: Dictionary = LEVEL_PROFILES[index].duplicate(true)
	var cycle := int((level_number - 1) / LEVEL_PROFILES.size())
	if cycle > 0:
		var caps: Array = profile["caps"].duplicate()
		if caps.size() < 7:
			caps.append(3 + ((level_number + cycle) % 3))
		profile["caps"] = caps
		var empties: Array = profile["empties"].duplicate()
		if cycle % 2 == 1 and empties.size() < 2:
			empties.append(4)
			profile["empties"] = empties
		profile["scramble"] = int(profile["scramble"]) + cycle * 12
		profile["title"] = "%s +" % profile["title"]
	return profile

func _generate_level(level_number: int) -> Array:
	var profile := _profile_for_level(level_number)
	var board: Array = []
	var color_offset := (level_number * 3) % PALETTE.size()
	var active_caps: Array = profile["caps"]

	for i in range(active_caps.size()):
		var cap := int(active_caps[i])
		var color_id := (color_offset + i) % PALETTE.size()
		var nut_stack: Array[int] = []
		for _j in range(cap):
			nut_stack.append(color_id)
		board.append({
			"capacity": cap,
			"nuts": nut_stack,
			"locked": false,
			"unlock_at": 0
		})

	for empty_cap in profile["empties"]:
		board.append({
			"capacity": int(empty_cap),
			"nuts": [],
			"locked": false,
			"unlock_at": 0
		})

	var rng := RandomNumberGenerator.new()
	rng.seed = level_number * 104729 + 811
	_reverse_scramble(board, int(profile["scramble"]), rng)
	_shuffle_board(board, rng)

	if bool(profile.get("locked_spare", false)):
		var initial_complete := _complete_count(board)
		board.append({
			"capacity": 4 if level_number % 2 == 0 else 5,
			"nuts": [],
			"locked": true,
			"unlock_at": initial_complete + 1
		})

	return board

func _reverse_scramble(board: Array, steps: int, rng: RandomNumberGenerator) -> void:
	for _step in range(steps):
		var sources: Array[int] = []
		for i in range(board.size()):
			var stack: Array = board[i]["nuts"]
			if stack.is_empty():
				continue
			var top_color = stack.back()
			if stack.size() == 1 or stack[stack.size() - 2] == top_color:
				sources.append(i)
		if sources.is_empty():
			return

		var source_index := sources[rng.randi_range(0, sources.size() - 1)]
		var source: Dictionary = board[source_index]
		var color_id = source["nuts"].back()

		var preferred_targets: Array[int] = []
		var fallback_targets: Array[int] = []
		for j in range(board.size()):
			if j == source_index:
				continue
			var target: Dictionary = board[j]
			if target["nuts"].size() >= int(target["capacity"]):
				continue
			fallback_targets.append(j)
			if target["nuts"].is_empty() or target["nuts"].back() != color_id:
				preferred_targets.append(j)

		var target_pool := preferred_targets if not preferred_targets.is_empty() else fallback_targets
		if target_pool.is_empty():
			continue
		var target_index := target_pool[rng.randi_range(0, target_pool.size() - 1)]
		var moved = source["nuts"].pop_back()
		board[target_index]["nuts"].append(moved)

func _shuffle_board(board: Array, rng: RandomNumberGenerator) -> void:
	for i in range(board.size() - 1, 0, -1):
		var j := rng.randi_range(0, i)
		var temp = board[i]
		board[i] = board[j]
		board[j] = temp

func _refresh_board() -> void:
	for child in board_grid.get_children():
		child.queue_free()

	var profile := _profile_for_level(current_level)
	level_label.text = "BOLUM %d" % current_level
	profile_label.text = "%s  •  %s" % [profile["title"], _capacity_summary()]
	moves_label.text = "Hamle: %d  •  Civata: %d" % [move_count, bolts.size()]

	board_grid.columns = 3 if bolts.size() <= 6 else 4
	for i in range(bolts.size()):
		var view := BoltViewScene.new()
		view.setup(i, bolts[i], PALETTE, i == selected_bolt)
		view.pressed.connect(_on_bolt_pressed)
		board_grid.add_child(view)

func _capacity_summary() -> String:
	var seen := {}
	for bolt in bolts:
		seen[int(bolt["capacity"])] = true
	var parts: Array[String] = []
	if seen.has(3):
		parts.append("Kucuk")
	if seen.has(4):
		parts.append("Orta")
	if seen.has(5):
		parts.append("Buyuk")
	return " / ".join(parts)

func _on_bolt_pressed(index: int) -> void:
	if won or index < 0 or index >= bolts.size():
		return
	var bolt: Dictionary = bolts[index]

	if bool(bolt.get("locked", false)):
		_invalid_move(index, "Bu civata kilitli. Once bir renk grubunu tamamla.")
		return

	if selected_bolt == -1:
		if bolt["nuts"].is_empty():
			_invalid_move(index, "Bos civatadan somun alamazsin.")
			return
		if _is_complete(bolt):
			_invalid_move(index, "Bu civata zaten tamamlandi.")
			return
		selected_bolt = index
		Input.vibrate_handheld(18)
		_refresh_board()
		return

	if selected_bolt == index:
		selected_bolt = -1
		_refresh_board()
		return

	var source: Dictionary = bolts[selected_bolt]
	var target: Dictionary = bolts[index]
	if bool(target.get("locked", false)):
		_invalid_move(index, "Hedef civata kilitli.")
		return
	if target["nuts"].size() >= int(target["capacity"]):
		_invalid_move(index, "Bu civatada yer yok.")
		return

	var color_id = source["nuts"].back()
	if not target["nuts"].is_empty() and target["nuts"].back() != color_id:
		_invalid_move(index, "Farkli rengin ustune koyamazsin.")
		return

	history.append({
		"bolts": bolts.duplicate(true),
		"moves": move_count
	})

	var run_count := 0
	for i in range(source["nuts"].size() - 1, -1, -1):
		if source["nuts"][i] == color_id:
			run_count += 1
		else:
			break
	var free_space := int(target["capacity"]) - target["nuts"].size()
	var transfer_count := min(run_count, free_space)
	for _n in range(transfer_count):
		target["nuts"].append(source["nuts"].pop_back())

	move_count += 1
	selected_bolt = -1
	Input.vibrate_handheld(24)
	_update_locks()
	_refresh_board()

	if _is_victory():
		_win_level()
	else:
		_set_status("Iyi hamle.", Color("#8ef0bd"))

func _update_locks() -> void:
	var complete_now := _complete_count(bolts)
	var unlocked_any := false
	for bolt in bolts:
		if bool(bolt.get("locked", false)) and complete_now >= int(bolt.get("unlock_at", 999)):
			bolt["locked"] = false
			unlocked_any = true
	if unlocked_any:
		Input.vibrate_handheld(55)
		_set_status("Yedek civata acildi!", Color("#8ef0bd"))

func _invalid_move(index: int, message: String) -> void:
	selected_bolt = -1
	Input.vibrate_handheld(75)
	_set_status(message, Color("#ff8ca0"))
	var children := board_grid.get_children()
	if index >= 0 and index < children.size() and children[index] is BoltView:
		children[index].flash_error()
	_refresh_board()

func _is_complete(bolt: Dictionary) -> bool:
	var stack: Array = bolt["nuts"]
	if stack.size() != int(bolt["capacity"]) or stack.is_empty():
		return false
	var first = stack[0]
	for value in stack:
		if value != first:
			return false
	return true

func _complete_count(board: Array) -> int:
	var count := 0
	for bolt in board:
		if _is_complete(bolt):
			count += 1
	return count

func _is_victory() -> bool:
	for bolt in bolts:
		var stack: Array = bolt["nuts"]
		if stack.is_empty():
			continue
		if not _is_complete(bolt):
			return false
	return true

func _win_level() -> void:
	won = true
	selected_bolt = -1
	Input.vibrate_handheld(140)
	_set_status("BOLUM TAMAMLANDI!  %d hamle" % move_count, Color("#ffe07a"))
	next_button.visible = true
	_refresh_board()

func _undo() -> void:
	if history.is_empty() or won:
		_invalid_move(-1, "Geri alinacak hamle yok.")
		return
	var snapshot: Dictionary = history.pop_back()
	bolts = snapshot["bolts"].duplicate(true)
	move_count = int(snapshot["moves"])
	selected_bolt = -1
	Input.vibrate_handheld(20)
	_refresh_board()
	_set_status("Son hamle geri alindi.", Color("#c7d2fe"))

func _restart_level() -> void:
	Input.vibrate_handheld(30)
	_load_level(current_level)

func _next_level() -> void:
	Input.vibrate_handheld(35)
	_load_level(current_level + 1)

func _set_status(message: String, color: Color) -> void:
	status_label.text = message
	status_label.add_theme_color_override("font_color", color)
