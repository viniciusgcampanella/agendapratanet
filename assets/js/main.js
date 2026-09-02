const teams = [
	{ name: "Equipe 4", members: "4 tecnicos", initials: "E4" },
	{ name: "Equipe 9", members: "3 tecnicos", initials: "E9" },
	{ name: "Equipe 10", members: "4 tecnicos", initials: "E10" },
	{ name: "Equipe terceirizada", members: "Gilson, Willian e Vinicius", initials: "ET" }
];
const storageKey = "agendapratanet-orders";
const historyKey = "agendapratanet-history";
const periods = { morning: "Manha · 08:00 - 12:00", afternoon: "Tarde · 13:00 - 18:00" };
const today = new Date();
const toISODate = (date) => { const year = date.getFullYear(); const month = String(date.getMonth() + 1).padStart(2, "0"); const day = String(date.getDate()).padStart(2, "0"); return `${year}-${month}-${day}`; };
const formatDate = (date) => new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "long", year: "numeric" }).format(new Date(`${date}T12:00:00`));
const todayISO = toISODate(today);
let orders = JSON.parse(localStorage.getItem(storageKey) || "[]").map((order) => ({ ...order, client: order.client || "Cliente nao informado", date: order.date || todayISO, period: order.period || (Number((order.time || "08:00").split(":")[0]) >= 13 ? "afternoon" : "morning") }));
let history = JSON.parse(localStorage.getItem(historyKey) || "[]");
let conflictsAvoided = Number(localStorage.getItem("agendapratanet-conflicts") || "0");
let operator = "Operador";
let calendarDate = new Date(today.getFullYear(), today.getMonth(), 1);
let selectedDate = todayISO;

const $ = (selector) => document.querySelector(selector);
const initials = (name) => name.split(/[ @]/).filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase();
const save = () => { localStorage.setItem(storageKey, JSON.stringify(orders)); localStorage.setItem(historyKey, JSON.stringify(history)); localStorage.setItem("agendapratanet-conflicts", String(conflictsAvoided)); };
const record = (message) => { history.unshift({ message, time: new Date().toLocaleString("pt-BR") }); history = history.slice(0, 20); save(); };

function renderTeams() {
	if ($("#team-list")) $("#team-list").innerHTML = teams.map((team) => `<div class="team-row"><div class="team-avatar">${team.initials}</div><div><strong>${team.name}</strong><small>${team.members}</small></div><span class="availability">Disponivel</span></div>`).join("");
	$("#all-team-cards").innerHTML = teams.map((team) => `<article class="panel team-large"><div class="team-row"><div class="team-avatar">${team.initials}</div><div><strong>${team.name}</strong><small>Ativa hoje</small></div><span class="availability">● Online</span></div><div class="member-list">${team.name === "Equipe terceirizada" ? "Gilson<br>Willian<br>Vinicius" : team.members}</div></article>`).join("");
	$("#order-team").innerHTML = teams.map((team) => `<option value="${team.name}">${team.name}</option>`).join("");
}
function getAvailablePeriods(team, date) {
	return Object.keys(periods).filter((period) => !orders.some((order) => order.team === team && order.date === date && order.period === period));
}
function updateAvailability() {
	const team = $("#order-team").value;
	const date = $("#order-date").value;
	const available = getAvailablePeriods(team, date);
	const currentPeriod = $("#order-period").value;
	$("#order-period").innerHTML = available.length ? available.map((period) => `<option value="${period}">${periods[period]}</option>`).join("") : '<option value="">Nenhum periodo livre</option>';
	if (available.includes(currentPeriod)) $("#order-period").value = currentPeriod;
	$("#availability-message").textContent = available.length ? `${available.length} periodo(s) disponivel(is) para ${team}.` : `${team} ja esta ocupada nos dois periodos desta data.`;
	checkConflicts();
}
function checkConflicts() {
	const neighborhood = $("#order-neighborhood").value.trim().toLowerCase();
	const date = $("#order-date").value;
	const team = $("#order-team").value;
	const period = $("#order-period").value;
	const conflict = orders.find((order) => order.date === date && order.neighborhood.toLowerCase() === neighborhood && order.team !== team);
	const occupied = orders.find((order) => order.date === date && order.team === team && order.period === period);
	const message = conflict ? `Este bairro ja esta reservado para a ${conflict.team} nesta data.` : occupied ? `${team} ja possui uma OS no periodo da ${periods[period]}.` : "";
	$("#conflict-message").textContent = message;
	$("#conflict-message").classList.toggle("hidden", !message);
}
function orderMarkup(order, table = false) {
	if (table) return `<div class="order-table-row"><strong>${order.number}</strong><span>${order.type}</span><span>${order.client}</span><span>${order.neighborhood}</span><span>${order.team}</span><span>${periods[order.period] || order.time}</span><span class="status-pill">Agendada</span></div>`;
	return `<div class="order-row"><div class="team-avatar">${initials(order.team)}</div><div class="order-info"><strong>${order.number} · ${order.client}</strong><small>${order.type} · ${order.neighborhood} · ${order.team}</small></div><span class="order-time">${periods[order.period] || order.time}</span></div>`;
}
function renderCalendar() {
	const year = calendarDate.getFullYear();
	const month = calendarDate.getMonth();
	const firstDay = new Date(year, month, 1).getDay();
	const offset = firstDay === 0 ? 6 : firstDay - 1;
	const days = new Date(year, month + 1, 0).getDate();
	$("#calendar-title").textContent = new Intl.DateTimeFormat("pt-BR", { month: "long", year: "numeric" }).format(calendarDate);
	$("#calendar-grid").innerHTML = `${Array.from({ length: offset }, () => '<span class="calendar-day empty"></span>').join("")}${Array.from({ length: days }, (_, index) => { const day = String(index + 1).padStart(2, "0"); const date = `${year}-${String(month + 1).padStart(2, "0")}-${day}`; const count = orders.filter((order) => order.date === date).length; return `<button class="calendar-day ${date === selectedDate ? "selected" : ""} ${date === todayISO ? "today" : ""}" data-date="${date}"><span>${index + 1}</span>${count ? `<b>${count}</b>` : ""}</button>`; }).join("")}`;
	document.querySelectorAll(".calendar-day[data-date]").forEach((day) => day.addEventListener("click", () => { selectedDate = day.dataset.date; renderCalendar(); renderDailyOrders(); }));
}
function renderDailyOrders() {
	const dailyOrders = orders.filter((order) => order.date === selectedDate).sort((a, b) => (a.period + a.number).localeCompare(b.period + b.number));
	$("#selected-day-title").textContent = selectedDate === todayISO ? "Hoje" : formatDate(selectedDate);
	$("#recent-orders").innerHTML = dailyOrders.length ? dailyOrders.map((order) => orderMarkup(order)).join("") : '<p class="muted">Nenhuma ordem para este dia.</p>';
}
function render() {
	const dailyOrders = orders.filter((order) => order.date === todayISO);
	$("#orders-count").textContent = dailyOrders.length;
	$("#teams-count").textContent = teams.length;
	$("#neighborhoods-count").textContent = new Set(dailyOrders.map((order) => order.neighborhood.toLowerCase())).size;
	$("#conflicts-count").textContent = conflictsAvoided;
	renderDailyOrders();
	$("#orders-table").innerHTML = orders.length ? '<div class="order-table-head"><span>OS</span><span>Tipo</span><span>Cliente</span><span>Bairro</span><span>Equipe</span><span>Periodo</span><span>Status</span></div>' + orders.map((order) => orderMarkup(order, true)).join("") : '<p class="muted">Sua agenda esta livre. Crie a primeira ordem.</p>';
	$("#history-list").innerHTML = history.length ? history.map((item) => `<div class="history-item"><strong>${item.message}</strong><small>${item.time}</small></div>`).join("") : '<p class="muted">As alteracoes da agenda aparecerao aqui.</p>';
	renderCalendar();
}
function showSection(section) {
	document.querySelectorAll(".page-section").forEach((element) => element.classList.add("hidden"));
	$(`#${section}-section`).classList.remove("hidden");
	document.querySelectorAll(".nav-item").forEach((item) => item.classList.toggle("active", item.dataset.section === section));
	$("#page-title").textContent = { overview: "Visao geral", orders: "Ordens de servico", teams: "Equipes", history: "Historico" }[section];
}
function openModal() { $("#order-modal").classList.remove("hidden"); $("#order-date").value = selectedDate; updateAvailability(); $("#order-number").focus(); }
function closeModal() { $("#order-modal").classList.add("hidden"); $("#conflict-message").classList.add("hidden"); }

$("#login-form").addEventListener("submit", (event) => { event.preventDefault(); operator = $("#login-email").value.split("@")[0] || "Operador"; $("#login-view").classList.add("hidden"); $("#app-view").classList.remove("hidden"); $("#user-name").textContent = operator; $("#welcome-name").textContent = operator; $("#user-avatar").textContent = initials(operator); record(`Login realizado por ${operator}`); render(); });
document.querySelectorAll(".nav-item, [data-section-link]").forEach((button) => button.addEventListener("click", () => showSection(button.dataset.section || button.dataset.sectionLink)));
$("#new-order-top").addEventListener("click", openModal); $("#new-order-button").addEventListener("click", openModal); $("#close-modal").addEventListener("click", closeModal);
$("#order-neighborhood").addEventListener("input", checkConflicts);
$("#order-team").addEventListener("change", updateAvailability);
$("#order-date").addEventListener("change", updateAvailability);
$("#order-period").addEventListener("change", checkConflicts);
$("#previous-month").addEventListener("click", () => { calendarDate = new Date(calendarDate.getFullYear(), calendarDate.getMonth() - 1, 1); renderCalendar(); });
$("#next-month").addEventListener("click", () => { calendarDate = new Date(calendarDate.getFullYear(), calendarDate.getMonth() + 1, 1); renderCalendar(); });
$("#order-form").addEventListener("submit", (event) => { event.preventDefault(); checkConflicts(); if (!$("#conflict-message").classList.contains("hidden")) { conflictsAvoided += 1; save(); render(); return; } const order = { number: $("#order-number").value.trim(), type: $("#order-type").value, client: $("#order-client").value.trim(), neighborhood: $("#order-neighborhood").value.trim(), date: $("#order-date").value, team: $("#order-team").value, period: $("#order-period").value }; orders.unshift(order); record(`${order.number} agendada para ${order.client} com ${order.team} em ${order.neighborhood}`); selectedDate = order.date; calendarDate = new Date(`${selectedDate}T12:00:00`); closeModal(); event.target.reset(); render(); showSection("orders"); });
const logout = () => { $("#app-view").classList.add("hidden"); $("#login-view").classList.remove("hidden"); }; $("#logout-button").addEventListener("click", logout); $("#header-logout").addEventListener("click", logout);
$("#today-label").textContent = formatDate(todayISO);
renderTeams(); render();
