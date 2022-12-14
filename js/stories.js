"use strict";

// This is the global list of the stories, an instance of StoryList
let storyList;

/** Get and show stories when site first loads. */

async function getAndShowStoriesOnStart() {
  storyList = await StoryList.getStories();
  $storiesLoadingMsg.remove();

  putStoriesOnPage();
}

/**
 * A render method to render HTML for an individual Story instance
 * - story: an instance of Story
 *
 * Returns the markup for the story.
 */



function generateStoryMarkup(story) {
  // console.debug("generateStoryMarkup", story);
  let starIconHTML = "";
  let storyIsAFavorite = false;

  if (currentUser) {
    for (const favorite of currentUser.favorites) {
      if (story.storyId === favorite.storyId) {
        storyIsAFavorite = true; //the clicked story is already a favorite
        break;
      }
    }
  }

  if (currentUser !== undefined && !storyIsAFavorite) {
    starIconHTML = "<i id=\"star-button\" class=\"bi bi-star\"></i>";
  } else if (currentUser !== undefined && storyIsAFavorite) {
    starIconHTML = "<i id=\"star-button\" class=\"bi bi-star-fill\"></i>";
  } else if (currentUser === undefined) {
    starIconHTML = "";
  }

  const hostName = story.getHostName();

  return $(`
      <li id="${story.storyId}">
      <span class="star-icon">${starIconHTML}</span>
        <a href="${story.url}" target="a_blank" class="story-link">
          ${story.title}
        </a>
        <small class="story-hostname">(${hostName})</small>
        <small class="story-author">by ${story.author}</small>
        <small class="story-user">posted by ${story.username}</small>
      </li>
    `);
}

/** Gets list of stories from server, generates their HTML, and puts on page. */

function putStoriesOnPage() {
  console.debug("putStoriesOnPage");

  $allStoriesList.empty();

  // loop through all of our stories and generate HTML for them
  for (let story of storyList.stories) {
    const $story = generateStoryMarkup(story);
    $allStoriesList.append($story);
  }

  $allStoriesList.show();
}

/** putSubmittedStoryOnPage: upon clicking, prepends new story to top of story
 * list and hides submit form
*/
async function putSubmittedStoryOnPage(evt) {
  evt.preventDefault();

  const author = $authorInput.val();
  const url = $urlInput.val();
  const title = $titleInput.val();

  console.log(author, url, title);
  const newStory = await storyList.addStory(
    currentUser,
    { title: title, author: author, url: url }
  );

  const $newStory = generateStoryMarkup(newStory);

  $allStoriesList.prepend($newStory);
  $submitStoryForm.hide();
}

$("#submitStory").on('click', putSubmittedStoryOnPage);


