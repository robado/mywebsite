// console.log("anilist.js")
let allAnime = [];

function loadAnimeList(username = "robaato") {
  // console.log("Loading anime list for:", username);

  const query = `
  # query of user completed animes
  query ($userName: String) {
    MediaListCollection(userName: $userName, type:ANIME, status:COMPLETED) {
      lists {
        name
        entries {
          score(format: POINT_10_DECIMAL)
          media {
            id
            siteUrl
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
            bannerImage
            format
            episodes
            averageScore
            season
            startDate {
              year
              month
              day
            }
          }
        }
      }
    }
  }
  `;

  fetch('https://graphql.anilist.co', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({
      query: query,
      variables: { userName: username }
    })
  })
    .then(response => response.json())
    .then(data => {
      if (!data.data || !data.data.MediaListCollection) {
        throw new Error("No anime list found. Check the username.");
      }
      // console.log("Anime list data:", data);
      const standardAnilistLists = ["Watching", "Completed", "Paused", "Dropped", "Planning", "Rewatching"];

      allAnime = data.data.MediaListCollection.lists
      // Only keep the standard list - Not custom lists for now
      .filter(list => standardAnilistLists.includes(list.name))
      .flatMap(list => list.entries)
      .filter(entry => entry.media);

      // If some extra weird dupes are left - dedupe
      const seen = new Map();
      for (const entry of allAnime) {
        if (!seen.has(entry.media.id)) {
          seen.set(entry.media.id, entry);
        }
      }
      allAnime = Array.from(seen.values());

      renderAnimeList();

    })
    .catch(error => {
      console.error("Anilist error", error);

      const animeList = document.getElementById("animeList");
      if (animeList) {
        animeList.innerHTML = `
      <p class="anime-error">
        Could not load anime list. Check username or try again later.
      </p>
      `;
      }
    });
}

function renderAnimeList() {
  const animeListContainer = document.getElementById("animeList");
  const animeCount = document.getElementById("animeCount");

  if (!animeListContainer) {
    console.error("Anime list container not found.");
    return;
  }

  const searchValue = document.getElementById("animeSearch")?.value.toLowerCase() || "";
  const sortValue = document.getElementById("animeSort")?.value || "title-asc";
  const formatValue = document.getElementById("animeFormat")?.value || "all";

  let filteredAnime = [...allAnime];

  // Search by anime filter
  if (searchValue) {
    filteredAnime = filteredAnime.filter(entry => {
      const title = getAnimeTitle(entry).toLowerCase();
      return title.includes(searchValue);
    });
  }

  // Filter by format
  if (formatValue !== "all") {
    filteredAnime = filteredAnime.filter(entry => {
      return entry.media.format === formatValue;
    });
  }

  // Sorting
  filteredAnime.sort((a, b) => {
    const titleA = getAnimeTitle(a);
    const titleB = getAnimeTitle(b);

    const scoreA = a.score || 0;
    const scoreB = b.score || 0;

    const yearA = a.media.startDate?.year || 0;
    const yearB = b.media.startDate?.year || 0;

    switch (sortValue) {
      case "title-asc":
        return titleA.localeCompare(titleB);

      case "title-desc":
        return titleB.localeCompare(titleA);

      case "score-desc":
        return scoreB - scoreA;

      case "score-asc":
        return scoreA - scoreB;
      
      case "year-desc":
        return yearB - yearA;

      case "year-asc":
        return yearA - yearB;

      default:
        return 0;
    }
  });

  if (animeCount) {
    animeCount.textContent = filteredAnime.length;
  }

  animeListContainer.innerHTML = filteredAnime.map(entry => {
    const anime = entry.media;
    const title = getAnimeTitle(entry);
    const image = anime.coverImage?.large || "";
    const score = entry.score || "N/A";
    const year = anime.startDate?.year || "Unknown";
    const format = anime.format || "Unknown";
    const episodes = anime.episodes || "?";
    const url = anime.siteUrl || `https://anilist.co/anime/${anime.id}`;

    return `
      <div class="anime-card">
        <div class="anime-image-wrapper">
          <a href="${url}" target="_blank" rel="noopener noreferrer" aria-label="View ${title} on AniList">
            <img 
              src=${image}
              alt=${title}
              class="anime-cover"
              loading="lazy"
            >
          </a>
        </div>

        <div class="anime-card-body">
          <h3 class="animet-title">${title}</h3>
        
          <div class="anime-meta">
            <span>${format}</span>
            <span>${year}</span>
          </div>

          <div class="anime-meta">
            <span>Episodes: ${episodes}</span>
            <span>Score: ${score}</span>
          </div>
        </div>
      </div>
    `;
  }).join("");
}

function getAnimeTitle(entry) {
  return (
    entry.media.title.english ||
    entry.media.title.romaji ||
    entry.media.title.userPreferred ||
    entry.media.title.native ||
    "Unknown Title"
  );
}

function setupAnimeControls() {
  const loadButton = document.getElementById("loadAnimeBtn");
  const usernameInput = document.getElementById("animeUsername");
  const searchInput = document.getElementById("animeSearch");
  const sortSelect = document.getElementById("animeSort");
  const formatSelect = document.getElementById("animeFormat");

  if (loadButton) {
    loadButton.addEventListener("click", function () {
      const username = usernameInput.value.trim();

      if (username) {
        loadAnimeList(username);
      }
    });
  }

  if (searchInput) {
    searchInput.addEventListener("input", renderAnimeList);
  }

  if (sortSelect) {
    sortSelect.addEventListener("change", renderAnimeList);
  }

  if (formatSelect) {
    formatSelect.addEventListener("change", renderAnimeList);
  }
}

function initAnimePage() {
  setupAnimeControls();

  const username = document.getElementById("animeUsername")?.value || "robaato";
  loadAnimeList(username);
}