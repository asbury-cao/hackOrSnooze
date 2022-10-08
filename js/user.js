"use strict";

// global to hold the User instance of the currently-logged-in user
let currentUser;

/******************************************************************************
 * User login/signup/login
 */

/** Handle login form submission. If login ok, sets up the user instance */

async function login(evt) {
  console.debug("login", evt);
  evt.preventDefault();

  // grab the username and password
  const username = $("#login-username").val();
  const password = $("#login-password").val();

  // User.login retrieves user info from API and returns User instance
  // which we'll make the globally-available, logged-in user.
  currentUser = await User.login(username, password);

  $loginForm.trigger("reset");

  saveUserCredentialsInLocalStorage();
  updateUIOnUserLogin();
}

$loginForm.on("submit", login);

/** Handle signup form submission. */

async function signup(evt) {
  console.debug("signup", evt);
  evt.preventDefault();

  const name = $("#signup-name").val();
  const username = $("#signup-username").val();
  const password = $("#signup-password").val();

  // User.signup retrieves user info from API and returns User instance
  // which we'll make the globally-available, logged-in user.
  currentUser = await User.signup(username, password, name);

  saveUserCredentialsInLocalStorage();
  updateUIOnUserLogin();

  $signupForm.trigger("reset");
}

$signupForm.on("submit", signup);

/** Handle click of logout button
 *
 * Remove their credentials from localStorage and refresh page
 */

function logout(evt) {
  console.debug("logout", evt);
  localStorage.clear();
  location.reload();
}

$navLogOut.on("click", logout);

/******************************************************************************
 * Storing/recalling previously-logged-in-user with localStorage
 */

/** If there are user credentials in local storage, use those to log in
 * that user. This is meant to be called on page load, just once.
 */

async function checkForRememberedUser() {
  console.debug("checkForRememberedUser");
  const token = localStorage.getItem("token");
  const username = localStorage.getItem("username");
  if (!token || !username) return false;

  // try to log in with these credentials (will be null if login failed)
  currentUser = await User.loginViaStoredCredentials(token, username);
}

/** Sync current user information to localStorage.
 *
 * We store the username/token in localStorage so when the page is refreshed
 * (or the user revisits the site later), they will still be logged in.
 */

function saveUserCredentialsInLocalStorage() {
  console.debug("saveUserCredentialsInLocalStorage");
  if (currentUser) {
    localStorage.setItem("token", currentUser.loginToken);
    localStorage.setItem("username", currentUser.username);
  }
}

/******************************************************************************
 * General UI stuff about users
 */

/** When a user signs up or registers, we want to set up the UI for them:
 *
 * - show the stories list
 * - update nav bar options for logged-in user
 * - generate the user profile part of the page
 */

function updateUIOnUserLogin() {
  console.debug("updateUIOnUserLogin");
  $loginForm.hide();
  $signupForm.hide();
  putStoriesOnPage();
  $allStoriesList.show();
  updateNavOnLogin();
}

// Favorites functionality
async function addOrRemoveFavorites(data) {
  let isAFavorite = false;
  let storyToUnfavoriteIndex;
  //TODO: use findIndex() array method instead
  for (let i = 0; i < currentUser.favorites.length; i++) {
    if (data.storyId === currentUser.favorites[i].storyId) {
      isAFavorite = true; //the clicked story is already a favorite
      storyToUnfavoriteIndex = i;
      break;
    }
  }

  const story = new Story(data);

  if (isAFavorite) { //remove this from favorites list
    console.log("i am already favorite, so remove me!");
    currentUser.removeFavorite(story); //delete fav request to server
    currentUser.favorites.splice(storyToUnfavoriteIndex, 1); //updates favorites array
    updateFavoritesUI();

  } else { //add this to the favorites list
    console.log("i'm not a favorite yet, so add me!");
    currentUser.addFavorite(story); //add fav request to server
    currentUser.favorites.push(story); //updates favorites array
    updateFavoritesUI();
  }
  return story;
}


$(".stories-list").on('click', ".star-icon", updateFavoritesListAndDisplay);

async function updateFavoritesListAndDisplay(evt) {
  evt.preventDefault();

  $(evt.target).toggleClass("bi-star bi-star-fill");

  const storyId = $(evt.target).closest("li").attr("id");

  const title = $(evt.target)
    .parentsUntil("#all-stories-list")
    .find(".story-link")[0].innerText;

  const author = $(evt.target)
    .parentsUntil("#all-stories-list")
    .find(".story-author")[0].innerText.slice(3);

  const url = $(evt.target)
    .parentsUntil("#all-stories-list")
    .find('.story-link').attr("href");

  const username = $(evt.target)
    .parentsUntil("#all-stories-list")
    .find('.story-user')[0].innerText.slice(10);

  let createdAt = new Date();
  createdAt = createdAt.toISOString();

  //TODO: shorten line length of code
  const data = { storyId: storyId, title: title, author: author, url: url, username: username, createdAt: createdAt };

  await addOrRemoveFavorites(data);
}

function updateFavoritesUI() {
  $allFavoritesList.empty();
  for (let story of currentUser.favorites) {
    const $story = generateStoryMarkup(story);
    $allFavoritesList.append($story);
  }

  // $allFavoritesList.show();
}


