// public/js/modules/settings/strategies.handlers.js
import { showModal, hideModal } from "../../services/modal.js";
import { loadHtmlPartial } from "../../utils/loadHtmlPartial.js";
import {
	addStrategy,
	deleteStrategy,
	getStrategiesBySourceId,
} from "./strategies.api.js";
import { renderStrategiesTable } from "./strategies.render.js";

/**
 * Opens the add strategy modal and populates the source ID.
 * @param {string} sourceId - The ID of the source to associate the new strategy with.
 */
export async function openAddStrategyModal(sourceId) {
    const formHtml = await loadHtmlPartial("_strategy-form-modal.html");

    const onSave = () => {
        const form = document.getElementById("log-strategy-form");
        if (form) {
            form.requestSubmit();
        }
    };

    showModal({
        title: "Add New Strategy",
        body: formHtml,
        actions: [
            { label: "Save", onClick: onSave, className: "btn" },
            { label: "Cancel", onClick: hideModal, className: "btn secondary-btn" },
        ],
    });

    const sourceIdField = document.getElementById("strategy-source-id");
    if (sourceIdField) {
        sourceIdField.value = sourceId;
    }

    const form = document.getElementById("log-strategy-form");
    if (form) {
        form.addEventListener("submit", handleAddStrategySubmit);
    }
}

export async function loadStrategiesForSource(sourceId, containerId) {
	console.log(
		`Handler: Loading strategies for source ID: ${sourceId} into ${containerId}`,
	);
	try {
		const strategies = await getStrategiesBySourceId(sourceId);
		renderStrategiesTable(strategies, containerId);
	} catch (error) {
		console.error("Error loading strategies:", error);
		const container = document.getElementById(containerId);
		if (container) {
			container.innerHTML = "<p>Error loading strategies.</p>";
		}
	}
}

export function handleAddStrategySubmit(event) {
	event.preventDefault();
	console.log("Handler: handleAddStrategySubmit called");

	const form = event.target;
	const formData = new FormData(form);
	const newStrategy = Object.fromEntries(formData.entries());

	addStrategy(newStrategy)
		.then((addedStrategy) => {
			console.log("Strategy added:", addedStrategy);
			hideModal();
			// Assuming the sourceId is available to refresh the list
			const sourceId = document.getElementById("strategy-source-id").value;
			if (sourceId) {
				loadStrategiesForSource(sourceId, "new-source-book-strategies-table"); // Refresh the list in the new source modal
				loadStrategiesForSource(sourceId, "edit-source-book-strategies-table"); // Refresh the list in the edit source modal
				loadStrategiesForSource(sourceId, "source-strategies-table"); // Refresh list in source detail modal
			}
		})
		.catch((error) => console.error("Error adding strategy:", error));
}

export function handleEditStrategyClick(strategyId) {
	console.log(
		"Handler: handleEditStrategyClick called (placeholder)",
		strategyId,
	);
	// Placeholder for loading strategy data into an edit form
}

export function handleDeleteStrategyClick(strategyId) {
	console.log(
		"Handler: handleDeleteStrategyClick called (placeholder)",
		strategyId,
	);
	if (confirm("Are you sure you want to delete this strategy?")) {
		deleteStrategy(strategyId)
			.then(() => {
				console.log("Strategy deleted:", strategyId);
				// Assuming the sourceId is available to refresh the list
				const sourceId = document.getElementById("strategy-source-id").value;
				if (sourceId) {
					loadStrategiesForSource(sourceId, "new-source-book-strategies-table"); // Refresh the list in the new source modal
					loadStrategiesForSource(
						sourceId,
						"edit-source-book-strategies-table",
					); // Refresh the list in the edit source modal
				}
			})
			.catch((error) => console.error("Error deleting strategy:", error));
	}
}
