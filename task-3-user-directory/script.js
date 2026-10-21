import { getUsers, getPosts } from "./api.js";

// Application state
let usersWithPosts = [];
let posts = [];
let searchText = "";
let sortBy = "name";
let selectedUserId = null;
let searchTimer = null;

// HTML elements
const statusElement = document.querySelector("#status");
const usersContainer = document.querySelector("#users-container");
const searchInput = document.querySelector("#search-input");
const sortSelect = document.querySelector("#sort-select");
const errorSection = document.querySelector("#error-section");
const errorMessage = document.querySelector("#error-message");
const retryButton = document.querySelector("#retry-button");
const emptyMessage = document.querySelector("#empty-message");
const detailSection = document.querySelector("#detail-section");
const detailName = document.querySelector("#detail-name");
const detailEmail = document.querySelector("#detail-email");
const postsList = document.querySelector("#posts-list");
const backButton = document.querySelector("#back-button");

// Retry a failed request up to 3 times.
async function retry(fn, attempts = 3) {
    let lastError;

    for (let attempt = 1; attempt <= attempts; attempt++) {
        try {
            return await fn();
        } catch (error) {
            lastError = error;

            if (attempt < attempts) {
                await new Promise((resolve) => {
                    setTimeout(resolve, 500);
                });
            }
        }
    }

    throw lastError;
}

// Load users and posts at the same time.
async function loadData() {
    statusElement.textContent = "Loading…";
    statusElement.classList.remove("hidden");
    errorSection.classList.add("hidden");
    usersContainer.replaceChildren();
    emptyMessage.classList.add("hidden");
    detailSection.classList.add("hidden");

    try {
        const [usersData, postsData] = await Promise.all([
            retry(getUsers, 3),
            retry(getPosts, 3)
        ]);

        usersWithPosts = combineUsersAndPosts(usersData, postsData);
        posts = postsData;

        statusElement.classList.add("hidden");
        renderUsers();
    } catch (error) {
        console.error("Unable to load directory:", error);

        statusElement.classList.add("hidden");
        errorMessage.textContent =
            "Sorry, we could not load users. Please check your connection and try again.";

        errorSection.classList.remove("hidden");
    }
}

// Count posts by userId, then attach each count to its user.
function combineUsersAndPosts(users, allPosts) {
    const postCounts = allPosts.reduce((counts, post) => {
        counts[post.userId] = (counts[post.userId] || 0) + 1;
        return counts;
    }, {});

    return users.map((user) => ({
        ...user,
        postCount: postCounts[user.id] || 0
    }));
}

// Return a new list matching the search and sort settings.
function getVisibleUsers() {
    const search = searchText.trim().toLowerCase();

    const filteredUsers = usersWithPosts.filter((user) => {
        return (
            user.name.toLowerCase().includes(search) ||
            user.email.toLowerCase().includes(search)
        );
    });

    if (sortBy === "posts") {
        return [...filteredUsers].sort(
            (a, b) => b.postCount - a.postCount
        );
    }

    return [...filteredUsers].sort((a, b) =>
        a.name.localeCompare(b.name)
    );
}

// Create and display all user cards.
function renderUsers() {
    usersContainer.replaceChildren();

    const visibleUsers = getVisibleUsers();

    emptyMessage.classList.toggle("hidden", visibleUsers.length !== 0);

    visibleUsers.forEach((user) => {
        const card = document.createElement("article");
        card.className = "user-card";
        card.tabIndex = 0;
        card.setAttribute("role", "button");
        card.setAttribute("aria-label", `View posts by ${user.name}`);
        card.dataset.userId = String(user.id);

        const name = document.createElement("h2");
        name.textContent = user.name;

        const email = document.createElement("p");
        email.textContent = `Email: ${user.email}`;

        const city = document.createElement("p");
        city.textContent = `City: ${user.address.city}`;

        const company = document.createElement("p");
        company.textContent = `Company: ${user.company.name}`;

        const count = document.createElement("span");
        count.className = "post-count";
        count.textContent = `${user.postCount} posts`;

        card.append(name, email, city, company, count);
        usersContainer.appendChild(card);
    });

    if (selectedUserId !== null) {
        renderUserDetails(selectedUserId);
    }
}

// Show the selected user's posts without making another API request.
function renderUserDetails(userId) {
    const user = usersWithPosts.find((item) => item.id === userId);

    if (!user) {
        detailSection.classList.add("hidden");
        return;
    }

    detailName.textContent = user.name;
    detailEmail.textContent = user.email;
    postsList.replaceChildren();

    const userPosts = posts.filter((post) => post.userId === userId);

    userPosts.forEach((post) => {
        const listItem = document.createElement("li");
        listItem.textContent = post.title;
        postsList.appendChild(listItem);
    });

    detailSection.classList.remove("hidden");
}

// Debounce waits until typing has stopped for 300 milliseconds.
function debounce(callback, delay) {
    return function (...args) {
        clearTimeout(searchTimer);

        searchTimer = setTimeout(() => {
            callback(...args);
        }, delay);
    };
}

// Search event.
searchInput.addEventListener(
    "input",
    debounce(() => {
        searchText = searchInput.value;
        renderUsers();
    }, 300)
);

// Sort event.
sortSelect.addEventListener("change", () => {
    sortBy = sortSelect.value;
    renderUsers();
});

// Click a card to show that user's posts.
usersContainer.addEventListener("click", (event) => {
    const card = event.target.closest("[data-user-id]");

    if (!card) {
        return;
    }

    selectedUserId = Number(card.dataset.userId);
    renderUserDetails(selectedUserId);
});

// Also allow users to open a card with the keyboard.
usersContainer.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" && event.key !== " ") {
        return;
    }

    const card = event.target.closest("[data-user-id]");

    if (!card) {
        return;
    }

    event.preventDefault();
    selectedUserId = Number(card.dataset.userId);
    renderUserDetails(selectedUserId);
});

// Back button hides the detail section.
backButton.addEventListener("click", () => {
    selectedUserId = null;
    detailSection.classList.add("hidden");
});

// Retry button runs the loading process again.
retryButton.addEventListener("click", () => {
    loadData();
});

// Start the app.
loadData();