import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import { Regex, Search } from "lucide-react";
import { productos } from "@lib/products";
import { items } from "@lib/categories";

const SearchButton = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const searchRef = useRef(null);
  const inputRef = useRef(null);

  // Initialize category map on component mount
  const categoryMap = useMemo(() => {
    const map = new Map();
    items.forEach((category) => {
      if (category.productos) {
        category.productos.forEach((productId) => {
          map.set(productId, category);
        });
      }
    });
    return map;
  }, []);

  const findCategoryByProductId = useCallback(
    (productId) => {
      return categoryMap.get(productId) || null;
    },
    [categoryMap]
  );

  const getCategoryName = useCallback(
    (productId) => {
      const category = findCategoryByProductId(productId);
      return category ? category.nombre.toUpperCase() : "UNCATEGORIZED";
    },
    [findCategoryByProductId]
  );

  const handleSearch = useCallback((event) => {
    const term = event.target.value.toLowerCase().trim();
    setSearchTerm(event.target.value);

    if (!term) {
      setSearchResults([]);
      return;
    }

    const results = productos
      .filter((product) => {
        let nombreProducto = product.nombre.toLowerCase() + "";
        let descripcionProducto = product.descripcion.toLowerCase() + "";

        // var regex = new RegExp(\*/, myKeyword);
        let regex = new RegExp(term, "g");
        return regex.test(nombreProducto) || regex.test(descripcionProducto);
      })
      .slice(0, 10);

    setSearchResults(results);
  }, []);

  const handleProductClick = useCallback(
    (product) => {
      const category = findCategoryByProductId(product.id);
      if (category) {
        window.location.href = `/categorias/${category.nombre}`;
      }
      setIsExpanded(false);
      setSearchTerm("");
      setSearchResults([]);
    },
    [findCategoryByProductId]
  );

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsExpanded(false);
        setSearchTerm("");
        setSearchResults([]);
      }
    };

    const handleEscapeKey = (event) => {
      if (event.key === "Escape") {
        setIsExpanded(false);
        setSearchTerm("");
        setSearchResults([]);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscapeKey);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscapeKey);
    };
  }, []);

  const handleSearchClick = useCallback(() => {
    setIsExpanded((prev) => !prev);
    if (!isExpanded) {
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [isExpanded]);

  return (
    <div className="flex items-center justify-end relative" ref={searchRef}>
      <div className="relative flex items-center">
        <div
          className={`absolute right-[70px] transition-all duration-300 ${
            isExpanded ? "w-[250px] opacity-100" : "w-0 opacity-0"
          }`}
        >
          <input
            ref={inputRef}
            type="text"
            value={searchTerm}
            onChange={handleSearch}
            className={`h-[70px] px-4 bg-white text-black focus:outline-none w-full transition-all`}
            placeholder="Buscar productos..."
            style={{ visibility: isExpanded ? "visible" : "hidden" }}
          />
        </div>
        <button
          onClick={handleSearchClick}
          className="bg-[#145EFF] w-[70px] h-[70px] p-6 flex justify-center items-center flex-shrink-0 hover:bg-blue-600 transition-colors z-10"
          aria-label="Search"
        >
          <Search className="w-6 h-6 text-white" />
        </button>
      </div>

      {isExpanded && searchResults.length > 0 && (
        <div className="absolute right-[70px] top-14 bottom-auto w-[250px] bg-white rounded-md shadow-lg mt-2 max-h-64 overflow-y-auto z-50">
          {searchResults.map((result) => (
            <div
              key={result.id}
              className="p-3 hover:bg-gray-100 cursor-pointer flex items-center"
              onClick={() => handleProductClick(result)}
            >
              <img
                src={result.fotoUrl}
                alt={result.nombre}
                className="h-10 w-10 object-cover mr-2"
                loading="lazy"
              />
              <div>
                <div className="text-black">{result.nombre}</div>
                <div className="text-gray-500 text-sm">
                  {getCategoryName(result.id)}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchButton;
