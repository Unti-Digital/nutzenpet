(() => {
  document.querySelectorAll("[data-banner-media]").forEach((field) => {
    const input = field.querySelector("[data-banner-image-id]");
    const preview = field.querySelector("[data-banner-preview]");
    const select = field.querySelector("[data-banner-select]");
    const remove = field.querySelector("[data-banner-remove]");

    if (!(input instanceof HTMLInputElement) || !(preview instanceof HTMLElement)) return;
    if (!(select instanceof HTMLButtonElement) || !(remove instanceof HTMLButtonElement)) return;

    select.addEventListener("click", () => {
      const frame = window.wp.media({
        title: "Selecionar arte do banner",
        button: { text: "Usar esta imagem" },
        library: { type: "image" },
        multiple: false,
      });

      frame.on("select", () => {
        const attachment = frame.state().get("selection").first().toJSON();
        const source = attachment.sizes?.large?.url || attachment.url;
        const image = document.createElement("img");
        image.src = source;
        image.alt = "";
        input.value = String(attachment.id);
        preview.replaceChildren(image);
        preview.classList.add("has-image");
        remove.hidden = false;
      });
      frame.open();
    });

    remove.addEventListener("click", () => {
      const empty = document.createElement("span");
      empty.textContent = "Nenhuma imagem selecionada";
      input.value = "";
      preview.replaceChildren(empty);
      preview.classList.remove("has-image");
      remove.hidden = true;
    });
  });
})();
