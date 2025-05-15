import { useState, useEffect } from "react";

export default function RickyAndMorty() {
  const [characters, setCharacters] = useState([]);
  const [filteredCharacters, setFilteredCharacters] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [genderFilter, setGenderFilter] = useState("");
  const [speciesFilter, setSpeciesFilter] = useState("");
  const [speciesOptions, setSpeciesOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    count: 0,
    pages: 0,
    next: null,
    prev: null,
    currentPage: 1,
  });

  useEffect(() => {
    fetchCharacters(pagination.currentPage);
  }, [pagination.currentPage]);

  useEffect(() => {
    if (characters.length > 0) {
      filterCharacters();
    }
  }, [searchTerm, statusFilter, genderFilter, speciesFilter, characters]);

  const fetchCharacters = async (page = 1) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `https://rickandmortyapi.com/api/character?page=${page}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();

      setCharacters(data.results);
      setPagination({
        count: data.info.count,
        pages: data.info.pages,
        next: data.info.next,
        prev: data.info.prev,
        currentPage: page,
      });

      const speciesSet = new Set(
        data.results.map((character) => character.species)
      );
      setSpeciesOptions(Array.from(speciesSet).sort());

      setLoading(false);
    } catch (err) {
      setError(`Error fetching characters: ${err.message}`);
      setLoading(false);
      console.error("Error fetching characters:", err);
    }
  };

  const filterCharacters = () => {
    const filtered = characters.filter((character) => {
      const nameMatch = character.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const statusMatch =
        statusFilter === "" || character.status.toLowerCase() === statusFilter;
      const genderMatch =
        genderFilter === "" || character.gender.toLowerCase() === genderFilter;
      const speciesMatch =
        speciesFilter === "" ||
        character.species.toLowerCase() === speciesFilter;

      return nameMatch && statusMatch && genderMatch && speciesMatch;
    });

    setFilteredCharacters(filtered);
  };

  const handlePrevPage = () => {
    if (pagination.prev) {
      setPagination((prev) => ({ ...prev, currentPage: prev.currentPage - 1 }));
    }
  };

  const handleNextPage = () => {
    if (pagination.next) {
      setPagination((prev) => ({ ...prev, currentPage: prev.currentPage + 1 }));
    }
  };

  const getStatusClass = (status) => {
    switch (status.toLowerCase()) {
      case "alive":
        return "bg-green-400";
      case "dead":
        return "bg-red-300";
      default:
        return "bg-gray-300";
    }
  };

  const debounce = (func, delay) => {
    let timeout;
    return function (...args) {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), delay);
    };
  };

  const handleSearchChange = debounce((value) => {
    setSearchTerm(value);
  }, 300);

  return (
    <div className="bg-gray-100 min-h-screen p-6">
      <div className="max-w-6xl mx-auto">
        <header className="text-center mb-8 p-6 bg-green-400 rounded-lg shadow-md">
          <h1 className="text-3xl font-bold text-brown-800 mb-4">
            Rick and Morty Character Explorer
          </h1>

          <div className="flex flex-wrap gap-4 justify-center">
            <input
              type="text"
              placeholder="Search by name..."
              className="p-3 border border-gray-300 rounded-md flex-1 max-w-xs text-base focus:outline-none focus:border-brown-700 focus:ring-2 focus:ring-brown-700"
              onChange={(e) => handleSearchChange(e.target.value)}
            />

            <select
              className="p-3 border border-gray-300 rounded-md flex-1 max-w-xs text-base focus:outline-none focus:border-brown-700"
              onChange={(e) => setStatusFilter(e.target.value)}
              value={statusFilter}
            >
              <option value="">All Statuses</option>
              <option value="alive">Alive</option>
              <option value="dead">Dead</option>
              <option value="unknown">Unknown</option>
            </select>

            <select
              className="p-3 border border-gray-300 rounded-md flex-1 max-w-xs text-base focus:outline-none focus:border-brown-700"
              onChange={(e) => setGenderFilter(e.target.value)}
              value={genderFilter}
            >
              <option value="">All Genders</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="genderless">Genderless</option>
              <option value="unknown">Unknown</option>
            </select>

            <select
              className="p-3 border border-gray-300 rounded-md flex-1 max-w-xs text-base focus:outline-none focus:border-brown-700"
              onChange={(e) => setSpeciesFilter(e.target.value)}
              value={speciesFilter}
            >
              <option value="">All Species</option>
              {speciesOptions.map((species, index) => (
                <option key={index} value={species.toLowerCase()}>
                  {species}
                </option>
              ))}
            </select>
          </div>
        </header>

        {loading ? (
          <div className="text-center p-8 text-xl text-gray-600">
            Loading characters...
          </div>
        ) : error ? (
          <div className="text-center p-8 text-xl text-red-600">{error}</div>
        ) : filteredCharacters.length === 0 ? (
          <div className="text-center p-8 text-xl text-gray-600">
            No characters match your filters. Try adjusting your search.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredCharacters.map((character) => (
              <div
                key={character.id}
                className="bg-white rounded-lg overflow-hidden shadow-md transition-transform duration-300 hover:translate-y-1 hover:shadow-lg"
              >
                <img
                  src={character.image}
                  alt={character.name}
                  className="w-full h-64 object-cover"
                />
                <div className="p-4">
                  <h3 className="text-lg font-bold text-brown-800 mb-2">
                    {character.name}
                  </h3>
                  <div className="text-sm">
                    <p className="mb-1">
                      <span
                        className={`inline-block px-2 py-1 rounded text-sm font-semibold ${getStatusClass(
                          character.status
                        )}`}
                      >
                        {character.status}
                      </span>
                    </p>
                    <p className="mb-1">
                      <strong>Species:</strong> {character.species}
                    </p>
                    <p className="mb-1">
                      <strong>Gender:</strong> {character.gender}
                    </p>
                    <p className="mb-1">
                      <strong>Origin:</strong> {character.origin.name}
                    </p>
                    <p className="mb-1">
                      <strong>Location:</strong> {character.location.name}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && !error && pagination.pages > 1 && (
          <div className="flex justify-center mt-8 gap-4">
            <button
              onClick={handlePrevPage}
              disabled={!pagination.prev}
              className="px-4 py-2 bg-brown-700 text-white rounded disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="px-4 py-2">
              Page {pagination.currentPage} of {pagination.pages}
            </span>
            <button
              onClick={handleNextPage}
              disabled={!pagination.next}
              className="px-4 py-2 bg-brown-700 text-white rounded disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
