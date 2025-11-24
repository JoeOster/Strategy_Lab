// public/js/utils/readMore.js

/**
 * Adds "See more" functionality to a container element.
 * @param {HTMLElement} container - The container with the description text.
 */
export function addReadMoreFunctionality(container) {
  const buttons = container.querySelectorAll(".read-more-btn");
  for (const button of buttons) {
    button.addEventListener("click", (event) => {
      const target = /** @type {HTMLElement} */ (event.target);
      const descriptionContainer = target.closest(".source-card-description, .strategy-description");
      if (descriptionContainer) {
        const dots = descriptionContainer.querySelector(".dots");
        const moreText = descriptionContainer.querySelector(".more-text");

        if (dots && moreText) {
          if (moreText.style.display === "none") {
            moreText.style.display = "inline";
            dots.style.display = "none";
            target.textContent = "See less";
          } else {
            moreText.style.display = "none";
            dots.style.display = "inline";
            target.textContent = "See more";
          }
        }
      }
    });
  }
}
