const teams = [
	{ name: "Equipe 4", members: "4 tecnicos", initials: "E4" },
	{ name: "Equipe 9", members: "3 tecnicos", initials: "E9" },
	{ name: "Equipe 10", members: "4 tecnicos", initials: "E10" },
	{ name: "Equipe terceirizada", members: "Gilson, Willian e Vinicius", initials: "ET" }
];
const storageKey = "agendapratanet-orders";
const historyKey = "agendapratanet-history";
let orders = JSON.parse(localStorage.getItem(storageKey) || "[]");
let history = JSON.parse(localStorage.getItem(historyKey) || "[]");
let conflictsAvoided = Number(localStorage.getItem("agendapratanet-conflicts") || "0");
let operator = "Operador";

const $ = (selector) => document.querySelector(selector);
const initials = (name) => name.split(/[ @]/).filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase();
const save = () => { localStorage.setItem(storageKey, JSON.stringify(orders)); localStorage.setItem(historyKey, JSON.stringify(history)); localStorage.setItem("agendapratanet-conflicts", String(conflictsAvoided)); };
const record = (message) => { history.unshift({ message, time: new Date().toLocaleString("pt-BR") }); history = history.slice(0, 20); save(); };

function renderTeams() {
	$("#team-list").innerHTML = teams.map((team) => `<div class="team-row"><div class="team-avatar">${team.initials}</div><div><strong>${team.name}</strong><small>${team.members}</small></div><span class="availability">Disponivel</span></div>`).join("");
	$("#all-team-cards").innerHTML = teams.map((team) => `<article class="panel team-large"><div class="team-row"><div class="team-avatar">${team.initials}</div><div><strong>${team.name}</strong><small>Ativa hoje</small></div><span class="availability">● Online</span></div><div class="member-list">${team.name === "Equipe terceirizada" ? "Gilson<br>Willian<br>Vinicius" : team.members}</div></article>`).join("");
	$("#order-team").innerHTML = teams.map((team) => `<option value="${team.name}">${team.name}</option>`).join("");
}
function orderMarkup(order, table = false) {
	if (table) return `<div class="order-table-row"><strong>${order.number}</strong><span>${order.type}</span><span>${order.neighborhood}</span><span>${order.team}</span><span class="status-pill">Agendada</span></div>`;
	return `<div class="order-row"><div class="team-avatar">${initials(order.team)}</div><div class="order-info"><strong>${order.number} · ${order.neighborhood}</strong><small>${order.type} com ${order.team}</small></div><span class="order-time">${order.time}</span></div>`;
}
function render() {
	$("#orders-count").textContent = orders.length;
	$("#teams-count").textContent = teams.length;
	$("#neighborhoods-count").textContent = new Set(orders.map((order) => order.neighborhood.toLowerCase())).size;
	$("#conflicts-count").textContent = conflictsAvoided;
	$("#recent-orders").innerHTML = orders.length ? orders.slice(0, 4).map((order) => orderMarkup(order)).join("") : '<p class="muted">Nenhuma ordem agendada ainda.</p>';
	$("#orders-table").innerHTML = orders.length ? '<div class="order-table-head"><span>OS</span><span>Tipo</span><span>Bairro</span><span>Equipe</span><span>Status</span></div>' + orders.map((order) => orderMarkup(order, true)).join("") : '<p class="muted">Sua agenda esta livre. Crie a primeira ordem.</p>';
	$("#history-list").innerHTML = history.length ? history.map((item) => `<div class="history-item"><strong>${item.message}</strong><small>${item.time}</small></div>`).join("") : '<p class="muted">As alteracoes da agenda aparecerao aqui.</p>';
}
function showSection(section) {
	document.querySelectorAll(".page-section").forEach((element) => element.classList.add("hidden"));
	$(`#${section}-section`).classList.remove("hidden");
	document.querySelectorAll(".nav-item").forEach((item) => item.classList.toggle("active", item.dataset.section === section));
	$("#page-title").textContent = { overview: "Visao geral", orders: "Ordens de servico", teams: "Equipes", history: "Historico" }[section];
}
function openModal() { $("#order-modal").classList.remove("hidden"); $("#order-number").focus(); }
function closeModal() { $("#order-modal").classList.add("hidden"); $("#conflict-message").classList.add("hidden"); }

$("#login-form").addEventListener("submit", (event) => { event.preventDefault(); operator = $("#login-email").value.split("@")[0] || "Operador"; $("#login-view").classList.add("hidden"); $("#app-view").classList.remove("hidden"); $("#user-name").textContent = operator; $("#welcome-name").textContent = operator; $("#user-avatar").textContent = initials(operator); record(`Login realizado por ${operator}`); render(); });
document.querySelectorAll(".nav-item, [data-section-link]").forEach((button) => button.addEventListener("click", () => showSection(button.dataset.section || button.dataset.sectionLink)));
$("#new-order-top").addEventListener("click", openModal); $("#new-order-button").addEventListener("click", openModal); $("#close-modal").addEventListener("click", closeModal);
$("#order-neighborhood").addEventListener("input", (event) => { const value = event.target.value.trim().toLowerCase(); const selectedTeam = $("#order-team").value; const conflict = orders.find((order) => order.neighborhood.toLowerCase() === value && order.team !== selectedTeam); $("#conflict-message").textContent = conflict ? `Este bairro ja esta reservado para a ${conflict.team}. Escolha outro local ou equipe.` : ""; $("#conflict-message").classList.toggle("hidden", !conflict); });
$("#order-form").addEventListener("submit", (event) => { event.preventDefault(); const neighborhood = $("#order-neighborhood").value.trim(); const team = $("#order-team").value; const conflict = orders.find((order) => order.neighborhood.toLowerCase() === neighborhood.toLowerCase() && order.team !== team); if (conflict) { conflictsAvoided += 1; save(); render(); $("#conflict-message").textContent = `Agendamento bloqueado: ${conflict.team} ja esta no bairro ${conflict.neighborhood}.`; $("#conflict-message").classList.remove("hidden"); return; } const order = { number: $("#order-number").value.trim(), type: $("#order-type").value, neighborhood, team, time: $("#order-time").value }; orders.unshift(order); record(`${order.number} agendada para ${order.team} no bairro ${order.neighborhood}`); closeModal(); event.target.reset(); render(); showSection("orders"); });
const logout = () => { $("#app-view").classList.add("hidden"); $("#login-view").classList.remove("hidden"); }; $("#logout-button").addEventListener("click", logout); $("#header-logout").addEventListener("click", logout);
renderTeams(); render();
