// console.log("anilist.js")

var query = `
# query of user completed animes
query {
  MediaListCollection(userName:"robaato", type:ANIME, status:COMPLETED) {
    user {
      id
      name
      statistics {
        anime {
          count
        }
      }
    }
    lists {
      entries {
        ...mediaListEntry
      }
    }
  }
}

fragment mediaListEntry on MediaList {
	score(format: POINT_10_DECIMAL)
	repeat
	customLists
	media {
		id
		title {
			userPreferred
			romaji
			english
			native
		}
		coverImage {
			large
			color
		}
		season
		type
		format
		episodes
		chapters
		averageScore
		bannerImage
		nextAiringEpisode {
			episode
		}
		startDate {
			year
			month
			day
		}
	}
}
`;

var variables = {
    id: 21827
}

var url = 'https://graphql.anilist.co' ,
    options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        },
        body: JSON.stringify({
            query: query
       })
    };

fetch(url, options).then(handleResponse).then(handleData).catch(handleError);

function handleResponse(response) {
    return response.json().then(function (json) {
        return response.ok ? json : Promise.reject(json);
    });
}

function handleData(data) {
    // console.log(data);
    var animeListContainer = document.getElementById('animeList');
    var mediaList = data.data.MediaListCollection.lists[0].entries; // First list contains all completed anime

    mediaList.forEach(function(entry) {
        var animeTitle = entry.media.title.userPreferred;
        var animeCover = entry.media.coverImage.large;

        // HTML elements for each anime
        var animeEntryContainer = document.createElement('div');
        animeEntryContainer.classList.add('anime-entry');

        var animeImageContainer = document.createElement('div');
        animeImageContainer.classList.add('anime-image');
        var animeImage = document.createElement('img');
        animeImage.src = animeCover;
        animeImage.alt = animeTitle;
        animeImageContainer.appendChild(animeImage);

        var animeTitleContainer = document.createElement('div');
        animeTitleContainer.classList.add('anime-title');
        var animeTitleElement = document.createElement('p');
        animeTitleElement.textContent = animeTitle;
        animeTitleContainer.appendChild(animeTitleElement);

        animeEntryContainer.appendChild(animeImageContainer);
        animeEntryContainer.appendChild(animeTitleContainer);

        animeListContainer.appendChild(animeEntryContainer);
    });

    // Get the amount of anime
    var animeCountContainer = document.getElementById('animeCount');
    var count = data.data.MediaListCollection.user.statistics.anime.count;
    animeCountContainer.textContent = count;

}

function handleError(error) {
    alert('Error, check console');
    console.error(error);
}