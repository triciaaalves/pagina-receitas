const searchInput = document.getElementById("search-input");
const searchBtn = document.getElementById("search-btn");
const mealsContainer = document.getElementById("meals");
const resultHeading = document.getElementById("result-heading");
const errorContainer = document.getElementById("error-container");
const errorMessage = document.getElementById("error-message");

// Elementos do Modal
const recipeModal = document.getElementById("recipe-modal");
const modalOverlay = document.getElementById("modal-overlay");
const btnCloseMobile = document.getElementById("close-modal-mobile");
const btnCloseDesktop = document.getElementById("close-modal-desktop");

const BASE_URL = "https://www.themealdb.com/api/json/v1/1/";
const SEARCH_URL = `${BASE_URL}search.php?s=`;
const LOOKUP_URL = `${BASE_URL}lookup.php?i=`;

// Eventos
searchBtn.addEventListener("click", searchMeals);
searchInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") searchMeals();
});
mealsContainer.addEventListener("click", handleMealClick);

// Fechar Modal
const closeModal = () => {
    recipeModal.classList.add("hidden");
    document.body.classList.remove("modal-open");
};
btnCloseMobile.addEventListener("click", closeModal);
btnCloseDesktop.addEventListener("click", closeModal);
modalOverlay.addEventListener("click", closeModal);
document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !recipeModal.classList.contains("hidden")) closeModal();
});

async function searchMeals() {
    const searchTerm = searchInput.value.trim();
    if (!searchTerm) {
        showError("Por favor, digite um ingrediente ou prato.");
        return;
    }

    try {
        resultHeading.innerHTML = `Buscando por <span style="color: var(--primary)">"${searchTerm}"</span>...`;
        mealsContainer.innerHTML = "";
        errorContainer.classList.add("hidden");

        const response = await fetch(`${SEARCH_URL}${searchTerm}`);
        const data = await response.json();
        
        if (!data.meals) {
            resultHeading.innerHTML = "";
            showError(`Nenhuma receita encontrada para "${searchTerm}".`);
        } else {
            resultHeading.innerHTML = `Receitas encontradas para <span style="color: var(--primary)">"${searchTerm}"</span>`;
            displayMeals(data.meals);
            searchInput.value = "";
        }
    } catch (error) {
        showError("Erro na conexão. Tente novamente mais tarde.");
    }
}

function showError(msg) {
    errorMessage.textContent = msg;
    errorContainer.classList.remove("hidden");
    mealsContainer.innerHTML = "";
}

function displayMeals(meals) {
    mealsContainer.innerHTML = meals.map(meal => `
        <div class="recipe-card" data-meal-id="${meal.idMeal}">
            <div class="card-img-container">
                <img src="${meal.strMealThumb}" alt="${meal.strMeal}">
                <div class="card-overlay"></div>
                ${meal.strCategory ? `<span class="card-badge">${meal.strCategory}</span>` : ''}
            </div>
            
            <div class="card-content">
                <h3 class="card-title">${meal.strMeal}</h3>
                <div class="card-meta">
                    <i class="fas fa-globe-americas"></i> ${meal.strArea || 'Desconhecida'}
                </div>
            </div>
        </div>
    `).join('');
}

async function handleMealClick(e) {
    const card = e.target.closest(".recipe-card");
    if (!card) return;

    try {
        const response = await fetch(`${LOOKUP_URL}${card.dataset.mealId}`);
        const data = await response.json();
        
        if (data.meals && data.meals[0]) {
            populateAndOpenModal(data.meals[0]);
        }
    } catch (error) {
        alert("Erro ao carregar os detalhes da receita.");
    }
}

function populateAndOpenModal(meal) {
    const ingredients = [];
    for (let i = 1; i <= 20; i++) {
        if (meal[`strIngredient${i}`] && meal[`strIngredient${i}`].trim() !== "") {
            ingredients.push({
                ingredient: meal[`strIngredient${i}`],
                measure: meal[`strMeasure${i}`]
            });
        }
    }

    document.getElementById("modal-img").src = meal.strMealThumb;
    document.getElementById("modal-img").alt = meal.strMeal;
    document.getElementById("modal-category").textContent = `${meal.strArea} • ${meal.strCategory}`;
    document.getElementById("modal-title").textContent = meal.strMeal;

    document.getElementById("modal-ingredients").innerHTML = ingredients.map(item => `
        <li>
            <i class="fas fa-check-circle"></i>
            <span><strong>${item.measure}</strong> ${item.ingredient}</span>
        </li>
    `).join('');

    const formattedInstructions = meal.strInstructions
        .split('\n')
        .filter(p => p.trim() !== '')
        .map(p => `<p>${p}</p>`)
        .join('');
    document.getElementById("modal-instructions").innerHTML = formattedInstructions;

    const youtubeContainer = document.getElementById("modal-youtube-container");
    if (meal.strYoutube) {
        youtubeContainer.innerHTML = `
            <a href="${meal.strYoutube}" target="_blank" class="youtube-btn">
                <i class="fab fa-youtube"></i> Assistir no YouTube
            </a>
        `;
        youtubeContainer.classList.remove("hidden");
    } else {
        youtubeContainer.classList.add("hidden");
    }

    recipeModal.classList.remove("hidden");
    document.body.classList.add("modal-open");
}