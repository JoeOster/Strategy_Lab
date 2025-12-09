// public/js/services/modal.js

const modal = document.getElementById("global-modal");
const modalTitle = document.getElementById("global-modal-title");
const modalBody = document.getElementById("global-modal-body");
const modalFooter = document.getElementById("global-modal-footer");
const closeButton = document.getElementById("global-modal-close");

/**
 * Hides the modal and clears its content.
 */
export function hideModal() {
    if (modal) {
        modal.style.display = "none";
    }
    if (modalTitle) {
        modalTitle.innerHTML = "";
    }
    if (modalBody) {
        modalBody.innerHTML = "";
    }
    if (modalFooter) {
        modalFooter.innerHTML = "";
    }
}

/**
 * Shows the modal with the specified title, body, and actions.
 * @param {object} options
 * @param {string} options.title - The title of the modal.
 * @param {string} options.body - The HTML content for the modal body.
 * @param {Array<{label: string, onClick: function, className?: string}>} options.actions - The actions (buttons) for the modal footer.
 */
export function showModal({ title, body, actions = [] }) {
    if (!modal || !modalTitle || !modalBody || !modalFooter) {
        console.error("Global modal elements not found.");
        return;
    }

    modalTitle.innerHTML = title;
    modalBody.innerHTML = body;
    modalFooter.innerHTML = "";

    actions.forEach(action => {
        const button = document.createElement("button");
        button.textContent = action.label;
        button.className = action.className || "btn";
        button.addEventListener("click", action.onClick);
        modalFooter.appendChild(button);
    });

    modal.style.display = "block";
}

// Close the modal when the 'X' button is clicked
if (closeButton) {
    closeButton.addEventListener("click", hideModal);
}

// Close the modal when the background is clicked
if (modal) {
    modal.addEventListener("click", (event) => {
        if (event.target === modal) {
            hideModal();
        }
    });
}
