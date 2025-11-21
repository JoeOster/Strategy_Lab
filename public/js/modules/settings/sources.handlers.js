import { error, log } from "../../utils/logger.js";
import {
	addSource,
	deleteSource,
	getSource,
	getSources,
	updateSource,
} from "./sources.api.js";
import { handleFetchIsbnInfo } from "./sources_books.handlers.js";
import { getWebApps } from "./webapps.api.js";

/** @typedef {import('../../types.js').Source} Source */

/** @type {Source[] | null} */
let cachedSources = null;

/**
 * Renders the list of sources into the container.
 * @param {Source[]} sources
 * @param {HTMLElement} container
 */
function renderSourcesList(sources, container) {
	if (sources.length === 0) {
		container.innerHTML = "<p>No advice sources found.</p>";
		return;
	}

	container.innerHTML = "";
	for (const source of sources) {
		const sourceElement = document.createElement("div");
		sourceElement.className = "advice-source-item";
		sourceElement.dataset.id = String(source.id);

		const infoSpan = document.createElement("span");
		infoSpan.classList.add("source-info");
		infoSpan.textContent = `${source.name} (${source.type})`;
		sourceElement.appendChild(infoSpan);

		const actionsDiv = document.createElement("div");
		actionsDiv.classList.add("source-actions");
		actionsDiv.innerHTML = `
      <button class="edit-source-btn table-action-btn btn-secondary" data-id="${source.id}">Edit</button>
      <button class="delete-source-btn table-action-btn btn-danger" data-id="${source.id}">Delete</button>
    `;
		sourceElement.appendChild(actionsDiv);
		container.appendChild(sourceElement);
	}
}

/**
 * Updates the image preview.
 * @param {string | undefined | null} type
 * @param {string | null} [filename]
 */
export function updateImagePreview(type, filename) {
	const previewImg = /** @type {HTMLImageElement | null} */ (
		document.getElementById("source-form-image-preview")
	);
	if (!previewImg || !type) {
		if (previewImg) previewImg.style.display = "none";
		return;
	}

	let folderPath = "images/";
	switch (type) {
		case "person":
			folderPath = "images/contacts/";
			break;
		case "group":
			folderPath = "images/group/";
			break;
		case "book":
			folderPath = "images/books/";
			break;
		case "website":
			folderPath = "images/url/";
			break;
		default:
			previewImg.style.display = "none";
			return;
	}

	const file = filename || "default.png";
	if (type === "book" && file.startsWith("http")) {
		previewImg.src = file;
	} else {
		previewImg.src = folderPath + file;
	}
	previewImg.style.display = "block";

	const genericPlaceholder = "images/contacts/default.png";
	// @ts-ignore
	previewImg.onerror = () => {
		previewImg.onerror = null;
		// @ts-ignore
		previewImg.src = genericPlaceholder;
	};
}

export async function openSourceDetailModal(sourceId) {
	const modal = document.getElementById("source-detail-modal");
	if (!modal) {
		error("Source detail modal not found.");
		return;
	}

	try {
		const source = await getSource(sourceId);
		if (!source) {
			error("Source not found for ID:", sourceId);
			return;
		}

		// Populate the modal content
		const profileContainer = document.getElementById(
			"source-profile-container",
		);
		const strategiesContainer = document.getElementById(
			"logged-strategies-container",
		);
		const modalTitle = document.getElementById("source-detail-modal-title");

		if (modalTitle) modalTitle.textContent = `Details for ${source.name}`;

		if (profileContainer) {
			profileContainer.innerHTML = `
                <div class="source-profile-image-wrapper">
                    <img src="${
											source.image_path || "images/contacts/default.png"
										}" alt="${source.name}" class="source-profile-image">
                </div>
                <div class="source-profile-details">
                    <h4>${source.name}</h4>
                    <p><strong>Type:</strong> ${source.type}</p>
                    ${
											source.url
												? `<p><strong>URL:</strong> <a href="${source.url}" target="_blank">${source.url}</a></p>`
												: ""
										}
                    ${
											source.description
												? `<p><strong>Description:</strong> ${source.description}</p>`
												: ""
										}
                    ${
											source.person_email
												? `<p><strong>Email:</strong> ${source.person_email}</p>`
												: ""
										}
                    ${
											source.person_phone
												? `<p><strong>Phone:</strong> ${source.person_phone}</p>`
												: ""
										}
                    ${
											source.person_app_handle
												? `<p><strong>App Handle:</strong> ${source.person_app_handle}</p>`
												: ""
										}
                    ${
											source.group_primary_contact
												? `<p><strong>Primary Contact:</strong> ${source.group_primary_contact}</p>`
												: ""
										}
                    ${
											source.group_email
												? `<p><strong>Group Email:</strong> ${source.group_email}</p>`
												: ""
										}
                    ${
											source.group_phone
												? `<p><strong>Group Phone:</strong> ${source.group_phone}</p>`
												: ""
										}
                    ${
											source.group_app_handle
												? `<p><strong>Group App Handle:</strong> ${source.group_app_handle}</p>`
												: ""
										}
                    ${
											source.book_author
												? `<p><strong>Author:</strong> ${source.book_author}</p>`
												: ""
										}
                    ${
											source.book_isbn
												? `<p><strong>ISBN:</strong> ${source.book_isbn}</p>`
												: ""
										}
                    ${
											source.website_websites
												? `<p><strong>Websites:</strong> ${source.website_websites}</p>`
												: ""
										}
                </div>
            `;
		}

		if (strategiesContainer) {
			strategiesContainer.innerHTML = `
                <h4>Logged Strategies</h4>
                <p>Loading strategies...</p>
            `;
			// TODO: Implement actual loading of strategies related to this source
		}

		// @ts-ignore
		modal.style.display = "block";
	} catch (err) {
		error("Error opening source detail modal:", err);
	}
}

/**
 * Populates the app type dropdowns.
 * @param {string | null} [personAppType]
 * @param {string | null} [groupAppType]
 */
async function populateWebAppDropdowns(
	personAppType = null,
	groupAppType = null,
) {
	const personSelect = /** @type {HTMLSelectElement | null} */ (
		document.getElementById("source-form-person-app-type")
	);
	const groupSelect = /** @type {HTMLSelectElement | null} */ (
		document.getElementById("source-form-group-app-type")
	);

	if (!personSelect || !groupSelect) return;

	personSelect.length = 1;
	groupSelect.length = 1;

	try {
		const webApps = await getWebApps();
		for (const app of webApps) {
			personSelect.add(new Option(app.name, app.name));
			groupSelect.add(new Option(app.name, app.name));
		}

		if (personAppType) personSelect.value = personAppType;
		if (groupAppType) groupSelect.value = groupAppType;
	} catch (error) {
		error("Failed to load web apps for dropdowns:", error);
	}
}

/**
 * Handles changes to the source type dropdown.
 * @param {string} [selectedType]
 * @param {Partial<import('../../types.js').Source>} [sourceData={}]
 */
export function handleSourceTypeChange(selectedType, sourceData = {}) {
	// Hide all dynamic panels
	const panels = document.querySelectorAll(
		"#source-form-fields-container .source-type-panel",
	);
	for (const panel of panels) {
		// @ts-ignore
		panel.style.display = "none";
	}

	// Show selected panel
	const selectedPanel = document.getElementById(
		`source-form-panel-${selectedType}`,
	);
	if (selectedPanel) {
		// @ts-ignore
		selectedPanel.style.display = "block";
	}

	// Show/hide main fields container
	const fieldsContainer = document.getElementById(
		"source-form-fields-container",
	);
	if (fieldsContainer) {
		// @ts-ignore
		fieldsContainer.style.display = selectedType ? "block" : "none";
	}

	// --- TOGGLE ISBN VISIBILITY (2-Column Layout) ---
	const isbnContainer = document.getElementById("source-form-isbn-container");
	if (isbnContainer) {
		// Only show ISBN input if type is 'book'
		isbnContainer.style.display = selectedType === "book" ? "block" : "none";
	}

	// Image Preview Logic
	const imgPathWrapper = document.getElementById(
		"source-form-image-path-wrapper",
	);
	if (imgPathWrapper) {
		if (selectedType) {
			imgPathWrapper.style.display = "block";
			updateImagePreview(selectedType, sourceData.image_path || "default.png");
		} else {
			imgPathWrapper.style.display = "none";
			updateImagePreview(selectedType, null);
		}
	}

	// Labels and URL visibility
	const nameLabel = document.querySelector('label[for="source-form-name"]');
	const urlWrapper = document.getElementById("source-form-url-wrapper");
	const urlLabel = document.querySelector('label[for="source-form-url"]');

	if (!nameLabel || !urlWrapper || !urlLabel) return;

	if (selectedType === "book") {
		nameLabel.textContent = "Title:";
		urlWrapper.style.display = "block";
		urlLabel.textContent = "Book URL:";
	} else if (selectedType === "website") {
		nameLabel.textContent = "Website Name:";
		urlWrapper.style.display = "block";
		urlLabel.textContent = "Website URL:";
	} else {
		nameLabel.textContent = "Name:";
		urlWrapper.style.display =
			selectedType === "person" || selectedType === "group" ? "none" : "block";
		urlLabel.textContent = "URL:";
	}
}

export async function loadSourcesList() {
	log("Handler: loadSourcesList called");
	const sourcesContainer = document.getElementById("advice-source-list");
	if (!sourcesContainer) return;

	if (cachedSources) {
		renderSourcesList(cachedSources, sourcesContainer);
		return;
	}

	sourcesContainer.innerHTML = "<p>Loading sources...</p>";
	try {
		const sources = await getSources();
		cachedSources = sources;
		renderSourcesList(sources, sourcesContainer);
	} catch (error) {
		error("Error loading sources list:", error);
		sourcesContainer.innerHTML = '<p class="error">Failed to load sources.</p>';
	}
}

/**
 * Opens the modal for adding/editing a source.
 * @param {string | null} sourceId
 */
export async function openSourceFormModal(sourceId = null) {
	const modal = document.getElementById("source-form-modal");
	const form = /** @type {HTMLFormElement | null} */ (
		document.getElementById("source-form-form")
	);
	const title = document.getElementById("source-form-title");
	const submitBtn = document.getElementById("source-form-submit-btn");

	if (!modal || !form || !title || !submitBtn) {
		error("Source form modal elements not found.");
		return;
	}

	const elements = {
		id: /** @type {HTMLInputElement} */ (form.elements.namedItem("id")),
		type: /** @type {HTMLSelectElement} */ (form.elements.namedItem("type")),
		name: /** @type {HTMLInputElement} */ (form.elements.namedItem("name")),
		url: /** @type {HTMLInputElement} */ (form.elements.namedItem("url")),
		description: /** @type {HTMLTextAreaElement} */ (
			form.elements.namedItem("description")
		),
		image_path: /** @type {HTMLInputElement} */ (
			form.elements.namedItem("image_path")
		),
		person_email: /** @type {HTMLInputElement} */ (
			form.elements.namedItem("person_email")
		),
		person_phone: /** @type {HTMLInputElement} */ (
			form.elements.namedItem("person_phone")
		),
		person_app_handle: /** @type {HTMLInputElement} */ (
			form.elements.namedItem("person_app_handle")
		),
		group_primary_contact: /** @type {HTMLInputElement} */ (
			form.elements.namedItem("group_primary_contact")
		),
		group_email: /** @type {HTMLInputElement} */ (
			form.elements.namedItem("group_email")
		),
		group_phone: /** @type {HTMLInputElement} */ (
			form.elements.namedItem("group_phone")
		),
		group_app_handle: /** @type {HTMLInputElement} */ (
			form.elements.namedItem("group_app_handle")
		),
		book_author: /** @type {HTMLInputElement} */ (
			form.elements.namedItem("book_author")
		),
		book_isbn: /** @type {HTMLInputElement} */ (
			form.elements.namedItem("book_isbn")
		),
		website_websites: /** @type {HTMLInputElement} */ (
			form.elements.namedItem("website_websites")
		),
	};

	form.reset();

	if (sourceId) {
		title.textContent = "Edit Source";
		submitBtn.textContent = "Save Changes";
		try {
			const source = await getSource(sourceId);
			if (!source) {
				console.error("Source not found for ID:", sourceId);
				return;
			}

			elements.id.value = source.id.toString();
			elements.type.value = source.type;
			elements.name.value = source.name;
			elements.url.value = source.url || "";
			elements.description.value = source.description || "";
			elements.image_path.value = source.image_path || "";

			elements.person_email.value = source.person_email || "";
			elements.person_phone.value = source.person_phone || "";
			elements.person_app_handle.value = source.person_app_handle || "";

			elements.group_primary_contact.value = source.group_primary_contact || "";
			elements.group_email.value = source.group_email || "";
			elements.group_phone.value = source.group_phone || "";
			elements.group_app_handle.value = source.group_app_handle || "";

			if (elements.book_author)
				elements.book_author.value = source.book_author || "";
			if (elements.book_isbn) elements.book_isbn.value = source.book_isbn || "";
			if (elements.website_websites)
				elements.website_websites.value = source.website_websites || "";

			await populateWebAppDropdowns(
				source.person_app_type,
				source.group_app_type,
			);
			handleSourceTypeChange(elements.type.value, source);
		} catch (error) {
			error("Error fetching source for editing:", error);
			return;
		}
	} else {
		title.textContent = "Add New Source";
		submitBtn.textContent = "Save Source";
		elements.id.value = "";
		await populateWebAppDropdowns();
		handleSourceTypeChange(elements.type.value);
	}

	const fetchBtn = document.getElementById("fetch-isbn-btn");
	if (fetchBtn) {
		const newFetchBtn = fetchBtn.cloneNode(true);
		fetchBtn.replaceWith(newFetchBtn);
		// @ts-ignore
		newFetchBtn.addEventListener("click", handleFetchIsbnInfo);
	}

	const closeButton = modal.querySelector(".close-button");
	if (closeButton) {
		// @ts-ignore
		closeButton.onclick = closeSourceFormModal;
	}

	// @ts-ignore
	modal.style.display = "block";
}

/**
 * Handles the submission of the form.
 */
export async function handleSourceFormSubmit(event) {
	event.preventDefault();
	const form = /** @type {HTMLFormElement} */ (event.target);
	const formData = new FormData(form);
	const sourceData = Object.fromEntries(formData.entries());
	const sourceId = sourceData.id;

	try {
		if (sourceId) {
			await updateSource(/** @type {string} */ (sourceData.id), sourceData);
			log("Source updated:", sourceId);
		} else {
			await addSource(sourceData);
			log("Source added");
		}
		cachedSources = null;
		loadSourcesList();
		closeSourceFormModal();
	} catch (error) {
		error("Error saving source:", error);
		alert("Error saving source. See console for details.");
	}
}

export function handleDeleteSourceClick(sourceId) {
	if (confirm("Are you sure you want to delete this source?")) {
		deleteSource(sourceId)
			.then(() => {
				log("Source deleted:", sourceId);
				cachedSources = null;
				loadSourcesList();
			})
			.catch((error) => {
				error("Error deleting source:", error);
				alert("Error deleting source. See console for details.");
			});
	}
}

export function closeSourceFormModal() {
	const modal = document.getElementById("source-form-modal");
	const form = /** @type {HTMLFormElement} */ (
		document.getElementById("source-form-form")
	);
	if (modal && form) {
		// @ts-ignore
		modal.style.display = "none";
		form.reset();
		const typeSelect = /** @type {HTMLSelectElement | null} */ (
			document.getElementById("source-form-type")
		);
		if (typeSelect) {
			typeSelect.value = "";
			handleSourceTypeChange(typeSelect.value);
		}
	}
}

export function initializeSourceSettings() {
	const clearBtn = document.getElementById("clear-source-form-btn");
	if (clearBtn) clearBtn.remove();

	const addSourceBtn = document.getElementById("open-add-source-btn");
	if (addSourceBtn) {
		addSourceBtn.addEventListener("click", () => openSourceFormModal(null));
	}

	const form = document.getElementById("source-form-form");
	if (form) {
		form.addEventListener("submit", handleSourceFormSubmit);
	}

	const modal = document.getElementById("source-form-modal");
	if (modal) {
		const closeButton = modal.querySelector(".close-button");
		if (closeButton) {
			closeButton.addEventListener("click", closeSourceFormModal);
		}
	}
}

export function handleClearSourceForm() {
	const form = /** @type {HTMLFormElement | null} */ (
		document.getElementById("source-form-form")
	);
	if (!form) return;

	const elements = {
		id: /** @type {HTMLInputElement} */ (form.elements.namedItem("id")),
		type: /** @type {HTMLSelectElement} */ (form.elements.namedItem("type")),
	};

	if (elements.id && elements.type) {
		const id = elements.id.value;
		form.reset();
		elements.id.value = id;
		elements.type.value = "";
		handleSourceTypeChange(elements.type.value);
	}
}
