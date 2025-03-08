"use strict";

class ContactClass {
    #title;
    #content;
    id;

    constructor(title, content) {
        this.#title = title || "";
        this.#content = content || "";
    }

    edit(data) {
        if (data) {
            this.#title = data.title?.trim() || this.#title;
            this.#content = data.content?.trim() || this.#content;
        }
    }

    get() {
        return {
            id: this.id,
            title: this.#title.trim(),
            content: this.#content.trim(),
        };
    }
}

class ContactsClass {
    #data = [];
    #lastId = 0;

    add(contactData = {}) {
        if (!contactData || !contactData.title?.trim() || !contactData.content?.trim()) return;

        const contact = new ContactClass(contactData.title, contactData.content);

        if (!contact) return;

        this.#lastId++;
        contact.id = this.#lastId;

        this.#data.push(contact);
    }

    edit(id, contactData = {}) {
        if (!id || !contactData) return;

        let contact = this.#data.find(item => item.id === id);

        if (contact) {
            contact.edit(contactData);
        }
    }

    remove(id) {
        if (!id) return;

        this.#data = this.#data.filter(item => item.id !== id);
    }

    get(print = 0) {
        if (print) {
            return this.#data.map(item => item.get());
        }
        return this.#data;
    }
}

class ContactsApp extends ContactsClass {
    constructor() {
        super();
        this.app = document.createElement("div");
        this.app.classList.add("contacts");

        this.createInterface();
        this.storage();
    }

    createInterface() {
        const form = document.createElement("form");
        form.classList.add("contact-form");

        const titleInput = document.createElement("input");
        titleInput.setAttribute("placeholder", "Имя");
        titleInput.classList.add("contact-title");

        const contentInput = document.createElement("input");
        contentInput.setAttribute("placeholder", "Номер");
        contentInput.classList.add("contact-content");

        const addButton = document.createElement("button");
        addButton.textContent = "Добавить";
        addButton.classList.add("add-btn");

        form.append(titleInput, contentInput, addButton);

        const contactList = document.createElement("div");
        contactList.classList.add("contact-list");

        this.app.append(form, contactList);

        addButton.addEventListener("click", (e) => {
            e.preventDefault();

            const title = titleInput.value.trim();
            const content = contentInput.value.trim();

            if (title && content) {
                this.add({ title, content });

                titleInput.value = "";
                contentInput.value = "";

                this.updateContactList();
                this.storage();
            }
        });
    }

    updateContactList() {
        const contactListContainer = this.app.querySelector(".contact-list");
        contactListContainer.innerHTML = "";

        const contacts = this.get(1);
        contacts.forEach(contact => {
            const contactElement = document.createElement("div");
            contactElement.classList.add("contact-item");
            contactElement.innerHTML = `
                <p><strong>${contact.title}</strong></p>
                <p>${contact.content}</p>
                <button class="edit-btn">Edit</button>
                <button class="remove-btn">Remove</button>
            `;

            contactElement.querySelector(".edit-btn").addEventListener("click", () => {
                const newTitle = prompt("Edit title:", contact.title);
                const newContent = prompt("Edit content:", contact.content);

                const updatedData = {};
                if (newTitle !== null) updatedData.title = newTitle;
                if (newContent !== null) updatedData.content = newContent;

                if (Object.keys(updatedData).length > 0) {
                    this.edit(contact.id, updatedData);
                    this.updateContactList();
                    this.storage();
                }
            });

            contactElement.querySelector(".remove-btn").addEventListener("click", () => {
                this.remove(contact.id);
                this.updateContactList();
                this.storage();
            });

            contactListContainer.append(contactElement);
        });
    }

    storage() {
        const data = this.get(1);
        localStorage.setItem('contactsData', JSON.stringify(data));

        const expirationDate = new Date();
        expirationDate.setDate(expirationDate.getDate() + 10);

        document.cookie = `storageExpiration=${expirationDate.toUTCString()}; path=/;`;

        this.clearExpiredStorage();
    }

    clearExpiredStorage() {
        const cookies = document.cookie.split('; ');

        const expirationCookie = cookies.find(cookie => cookie.startsWith('storageExpiration='));
        if (expirationCookie) {
            const expirationDate = new Date(expirationCookie.split('=')[1]);

            if (expirationDate <= new Date()) {
                localStorage.removeItem('contactsData');
                document.cookie = 'storageExpiration=; Max-Age=0; path=/;';
            }
        }
    }
}

const app = new ContactsApp();
document.body.append(app.app);
