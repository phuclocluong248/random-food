const meals = document.getElementById('meals'); 
const favoriteContainer = document.getElementById("fav-meals")
const search_btn = document.getElementById("search_btn");
const searchTerm = document.getElementById("search-term");
const close_btn = document.getElementById("close-popup");

const mealPopup = document.getElementById("meal-popup");
const mealInfoEl = document.getElementById("meal-info");
const popupCloseBtn = document.getElementById("close-popup");

function getRandomMeal() {
    // return new Promise((resolve, reject) => {
        fetch("https://www.themealdb.com/api/json/v1/1/random.php").then(response => {
            return response.json()
        })
        .then(data => {
            const randomMeal = data.meals[0];
            currentMeal = randomMeal;
            console.log(currentMeal);
            // resolve(randomMeal);
            addMeal(randomMeal, true); 
        });
    // });
}
getRandomMeal();
fetchFavMeals();
function addMeal(mealData,random = false) {
        const meal = document.createElement("div"); 
        meal.classList.add("meal"); 
        meal.innerHTML = `
        <div class="meal-header">
            ${
                random 
                    ? `
            <h3 class="random">Random Recipe</h3>
            ` 
                        : ""
            }
            <img class = "meal-thumb" id="meal-thumb" src="${mealData.strMealThumb}" alt="${mealData.strMeal}"/>
        </div>
        <div class="meal-body">
            <h4 id="meal-name">${mealData.strMeal}</h4>
            <button class="heart_btn" >
                <i class = "fas fa-heart"></i>
            </button>
           
        </div>
               
        `
        const mealThumb = meal.querySelector(".meal-thumb");
        const btn = meal.querySelector('.meal-body .heart_btn');
        btn.addEventListener('click', () => {
            if (btn.classList.contains('active')){
                removeMealFromLS(mealData.idMeal);
                btn.classList.remove('active');
                
            } else {
                addMealToLS(mealData.idMeal);
                btn.classList.toggle('active');
                addMealToFav(mealData);
                
            }
            favoriteContainer.innerHTML = '';
            fetchFavMeals();
        });
        mealThumb.addEventListener('click', () =>{
            showMealInfo(mealData);
        });
        meals.appendChild(meal); 

                
       
};
function showMealInfo(mealData) {
    mealInfoEl.innerHTML = '';
    const mealEl = document.createElement('div');
    //get ingredients and measure
    const ingredients = [];
     
    for (let i=1; i<=20; i++){
        if ((mealData['strIngredient'+i] !== "") &&(mealData['strIngredient'+i] !== null)) {
            ingredients.push(`${mealData['strIngredient'+i]} - ${mealData['strMeasure'+i]} `);
       } else {
           break;
       }
    };
    mealInfoEl.appendChild(mealEl);
    console.log(mealData);
    mealEl.innerHTML = `
                        <h1> ${mealData.strMeal} </h1>
                        <img src="${mealData.strMealThumb}" alt="${mealData.strMeal}"/>
                        <p>
                        ${mealData.strInstructions}
                        </p>
                        <h3>Ingredients: </h3>
                        <ul> 
                            ${ingredients.
                                map(
                                    (ing) => `
                                    <li>${ing}</li>
                                    `
                                    )
                                    .join(' ')}
                        </ul>
                        <h3> Video </h3>
                        <a href="${mealData.strYoutube}" target="_blank">"${mealData.strYoutube}"</a>
    `;
    mealPopup.classList.remove('hidden');

}

function addMealToLS(mealId) {
    const mealIds = getMealsFromLS();
    localStorage.setItem('mealIds', JSON.stringify ([...mealIds, mealId]));
}
function getMealsFromLS() {
    const mealIds = JSON.parse(localStorage.getItem("mealIds")); 
    
    return mealIds === null ? [] : mealIds;
}

function removeMealFromLS(mealId) {
    const mealIds = getMealsFromLS();

    localStorage.setItem('mealIds', JSON.stringify(mealIds.filter(id => id !== mealId)));
}


function getMealId(Id) {
    return new Promise((resolve, reject) => {
        fetch("https://www.themealdb.com/api/json/v1/1/lookup.php?i=" + Id).then(response => {
            return response.json()
        })
        .then(data => {
            const mealDataId = data.meals[0];
            
            resolve(mealDataId);
        });
    });
}


function getMealSearch(term) {
    return new Promise((resolve, reject) => {
        fetch("https://www.themealdb.com/api/json/v1/1/search.php?s=" + term).then(response => {
            return response.json()
        })
        .then(data => {
            resolve(data.meals);
        });
    });

}
async function fetchFavMeals() { 
    //clean the container 
    favoriteContainer.innerHTML = ''; 
    const mealIds = getMealsFromLS();
    const meals = [];
    for (let i = 0; i<mealIds.length; i++) {
        const mealId = mealIds[i];
        meal = await getMealId(mealId);
        addMealToFav(meal);
    };
               
    //TODO: add them to the screen; 
}

function addMealToFav(mealData) {
    const favMeal = document.createElement("li"); 
    
    favMeal.innerHTML = `
    <img src="${mealData.strMealThumb}" alt="${mealData.strMeal}" id="${mealData.idMeal}"><span>${mealData.strMeal}</span></h1>
    <button class="clear" ><i class = "fas fa-window-close"></i></button>
    `
    const cls_btn = favMeal.querySelector(".clear"); 
    const favImg = favMeal.querySelector("img");
    cls_btn.addEventListener("click", () => {
        removeMealFromLS(mealData.idMeal);

        fetchFavMeals();
    })
    favImg.addEventListener("click", () => {
        showMealInfo(mealData)
    })
    favoriteContainer.appendChild(favMeal); 
   
} 
search_btn.addEventListener('click', async () => {
    //clean container
    meals.innerHTML = "";

    const term = searchTerm.value; 
    console.log(term);
    const mealSearch = await getMealSearch(term);
    console.log(mealSearch);
    if (mealSearch) {
        mealSearch.forEach((meal) => {
        addMeal(meal);
    });
    }
    

}); 

popupCloseBtn.addEventListener("click", () => {
        mealPopup.classList.add("hidden");
});

