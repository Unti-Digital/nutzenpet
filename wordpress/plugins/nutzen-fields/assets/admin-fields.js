document.addEventListener("DOMContentLoaded", () => {
  const list = document.querySelector("[data-fields-list]");
  const template = document.querySelector("#tmpl-nutzen-field");
  if (!list || !template) return;

  const refresh = () => {
    [...list.querySelectorAll("[data-field-row]")].forEach((row, index) => {
      row.querySelectorAll("[name]").forEach((input) => {
        input.name = input.name.replace(/nutzen_fields\[[^\]]+\]/, `nutzen_fields[${index}]`);
      });
      const type = row.querySelector("[data-field-type]")?.value;
      const options = row.querySelector("[data-field-options]");
      if (options) options.hidden = type !== "select";
    });
  };

  const addField = () => {
    const wrapper = document.createElement("div");
    wrapper.innerHTML = template.innerHTML.replaceAll("__INDEX__", String(list.children.length)).trim();
    list.append(wrapper.firstElementChild);
    refresh();
    list.lastElementChild?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  document.querySelectorAll("[data-add-field]").forEach((button) => button.addEventListener("click", addField));
  list.addEventListener("input", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLInputElement) || !target.matches("[data-field-label]")) return;
    const title = target.closest("[data-field-row]")?.querySelector("[data-field-title]");
    if (title) title.textContent = target.value || "Campo sem nome";
  });
  list.addEventListener("change", refresh);
  list.addEventListener("click", (event) => {
    if (!(event.target instanceof Element)) return;
    const button = event.target.closest("button");
    if (!button) return;
    const row = button.closest("[data-field-row]");
    if (!row) return;
    if (button.matches("[data-remove-field]")) {
      if (window.confirm("Remover esta definição? Os valores já salvos nos produtos serão preservados.")) row.remove();
    } else if (button.matches("[data-duplicate-field]")) {
      const clone = row.cloneNode(true);
      const key = clone.querySelector('input[name$="[key]"]');
      const label = clone.querySelector("[data-field-label]");
      if (key) key.value = `${key.value}_copia`;
      if (label) label.value = `${label.value} (cópia)`;
      row.after(clone);
    } else if (button.matches("[data-move-up]") && row.previousElementSibling) {
      row.previousElementSibling.before(row);
    } else if (button.matches("[data-move-down]") && row.nextElementSibling) {
      row.nextElementSibling.after(row);
    }
    refresh();
  });
  refresh();
});
