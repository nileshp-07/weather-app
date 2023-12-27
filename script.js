const userTab =  document.querySelector("[data-userWeather]");
const searchTab = document.querySelector("[data-searchWeather]");
const weatherContainer = document.querySelector(".weather-container");
const grantAcessContainer  = document.querySelector(".grant-access-container");
const searchForm  = document.querySelector("[data-search]");
const loadingScreen = document.querySelector(".loading-container");
const weatherInfoContainer = document.querySelector(".weather-info-container");


const notFound = document.querySelector('.errorContainer');
const errorBtn = document.querySelector('[data-errorButton]');
const errorText = document.querySelector('[data-errorText]');
const errorImage = document.querySelector('[data-errorImg]');


// initiale variable
const API_KEY="168771779c71f3d64106d8a88376808a";
let currentTab = userTab;
currentTab.classList.add("current-tab");  

// render the weather info if coordinates are already available 
getFromSessionStorage();



userTab.addEventListener('click' , () =>{   //apne hisab  se karke dekhn he ('click' , switchTab())
    // pass clicked tab as input parameters 
    switchTab(userTab);
});   


searchTab.addEventListener('click' , () =>{   
    // pass clicked tab as input parameters 
    switchTab(searchTab);
});  



function switchTab(clickedTab)
{
    notFound.classList.remove("active");
    if(clickedTab != currentTab)
    {
        currentTab.classList.remove("current-tab");
        currentTab = clickedTab;
        currentTab.classList.add("current-tab");


        if(!searchForm.classList.contains("active"))  // yaha mene apne hisab se try kara he ek baar check karlena
        {
            // new tab is searchTab 
            weatherInfoContainer.classList.remove("active");
            grantAcessContainer.classList.remove("active");
            searchForm.classList.add("active");
        }
        else{
            // new tab is userTab 
            searchForm.classList.remove("active");
            weatherInfoContainer.classList.remove("active");

            // get the location of user
            getFromSessionStorage();
        }
    }
}


// check if coordinates is already present 
function getFromSessionStorage(){
    const localCoordinates = sessionStorage.getItem("user-coordinates");
    if(!localCoordinates)
    {
        grantAcessContainer.classList.add("active");
    }
    else{
        const coordinates = JSON.parse(localCoordinates);
        fetchUserWeatherInfo(coordinates);
    }
}



async function fetchUserWeatherInfo(coordinates)
{
    const {lat , lon} = coordinates;

    // make grantAcessContainer  section not visible
    grantAcessContainer.classList.remove("active");
    
    // make loader visible
    loadingScreen.classList.add("active");


    // API CALL 
    try{
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`);

        const data = await response.json();

        // now make loadingScreen invisible
        loadingScreen.classList.remove("active");

        // now make the weatherInfoContainer visible
        weatherInfoContainer.classList.add("active");


        // now render the infomation into UI 
        renderWeatherInfo(data);

    }
    catch{
        loadingScreen.classList.remove('active');
        notFound.classList.add('active');
        errorImage.style.display = 'none';
        errorText.innerText = `Error: ${err?.message}`;
        errorBtn.style.display = 'block';
        errorBtn.addEventListener("click", fetchUserWeatherInfo);
    }
}


function renderWeatherInfo(weatherInfo){
    // firstly we have to fetch all the element 

    const cityName = document.querySelector("[data-cityName]");
    const countryFlag = document.querySelector("[data-countryFlag]");
    const weatherDesc = document.querySelector("[data-weatherDesc]");
    const weatherIcon = document.querySelector("[data-weatherIcon]");
    const weatherTemp = document.querySelector("[data-temperature]");
    const windSpeed = document.querySelector("[data-windSpeed]");
    const humidity = document.querySelector("[data-humidity]");
    const cloudiness = document.querySelector("[data-cloudiness]");


    // now render the info into these element 
    cityName.innerText = weatherInfo?.name;
    countryFlag.src = `https://flagcdn.com/144x108/${weatherInfo?.sys?.country.toLowerCase()}.png`;
    weatherDesc.innerText = weatherInfo?.weather?.[0]?.description;
    weatherIcon.src = `http://openweathermap.org/img/w/${weatherInfo?.weather?.[0]?.icon}.png`;
    weatherTemp.innerText = `${weatherInfo?.main?.temp.toFixed(2)} °C`;
    windSpeed.innerText = `${weatherInfo?.wind?.speed.toFixed(2)} m/s`;
    humidity.innerText = `${weatherInfo?.main?.humidity.toFixed(2)} %`;
    cloudiness.innerText = `${weatherInfo?.clouds?.all.toFixed(2)} %`;
}



const grantAccessBtn = document.querySelector("[data-grantAccess]");
grantAccessBtn.addEventListener("click" , getLocation);


function getLocation(){
    if(navigator.geolocation)
    {
        navigator.geolocation.getCurrentPosition(showPosition);
    }
    else{
        // HW - > show an alert if GeolocationPosition is not available 
    }
}


function showPosition(position)
{
    const userCoordinates = {
        lat : position.coords.latitude,
        lon : position.coords.longitude
    };

    sessionStorage.setItem("user-coordinates", JSON.stringify(userCoordinates));
    fetchUserWeatherInfo(userCoordinates);
}


// search for weather 
const seachInput = document.querySelector("[data-searchInput]");
searchForm.addEventListener('submit' , (e) =>{
    e.preventDefault();
    let cityName = seachInput.value;

    seachInput.value="";

    if(cityName === "")
    return;

    else
    fetchsearchWeatherInfo(cityName);
})


async function fetchsearchWeatherInfo(city) {
    loadingScreen.classList.add("active");
    weatherInfoContainer.classList.remove("active");
    grantAcessContainer.classList.remove("active");
    notFound.classList.remove("active");
    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`);

        const data = await response.json();
        if (!data.sys) {
            throw data;
        }
        loadingScreen.classList.remove('active');
        weatherInfoContainer.classList.add('active');
        renderWeatherInfo(data);
    }
    catch (err) {
        loadingScreen.classList.remove('active');
        weatherInfoContainer.classList.remove('active');
        notFound.classList.add('active');
        errorText.innerText = `${err?.message}`;
        errorBtn.style.display = "none";
    }
}
