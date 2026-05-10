import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { api } from "../lib/api.js";
import { storage } from "../lib/storage.js";
import { useToast } from "./ToastContext.jsx";

const ShopContext = createContext(null);

const initialFilters = {
  search: "",
  genre: "",
  platform: "",
  launcher: "",
  minPrice: 0,
  maxPrice: 200,
  sort: "rating-desc",
  page: 1,
};

export function ShopProvider({ children }) {
  const { notify } = useToast();
  const [games, setGames] = useState([]);
  const [allGames, setAllGames] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    totalItems: 0,
    limit: 9,
  });
  const [filters, setFilters] = useState(initialFilters);
  const [options, setOptions] = useState({
    genres: [],
    platforms: [],
    launchers: [],
  });
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState(storage.get("gamevault_cart", []));
  const [wishlist, setWishlist] = useState(
    storage.get("gamevault_wishlist", []),
  );

  useEffect(() => {
    storage.set("gamevault_cart", cart);
  }, [cart]);

  useEffect(() => {
    storage.set("gamevault_wishlist", wishlist);
  }, [wishlist]);

  useEffect(() => {
    api("/api/filters")
      .then((data) => setOptions(data))
      .catch((error) => notify(error.message));
  }, [notify]);

  useEffect(() => {
    api("/api/games?limit=30&maxPrice=200")
      .then((data) => setAllGames(data.games))
      .catch((error) => notify(error.message));
  }, [notify]);

  useEffect(() => {
    const params = new URLSearchParams({
      search: filters.search,
      genre: filters.genre,
      platform: filters.platform,
      launcher: filters.launcher,
      minPrice: String(filters.minPrice),
      maxPrice: String(filters.maxPrice),
      sort: filters.sort,
      page: String(filters.page),
      limit: "9",
    });

    setLoading(true);
    api(`/api/games?${params.toString()}`)
      .then((data) => {
        setGames(data.games);
        setPagination(data.pagination);
      })
      .catch((error) => notify(error.message))
      .finally(() => setLoading(false));
  }, [filters, notify]);

  function updateFilter(key, value) {
    setFilters((current) => {
      const next = { ...current, [key]: value, page: 1 };
      if (key === "minPrice" && Number(value) > next.maxPrice)
        next.maxPrice = Number(value);
      if (key === "maxPrice" && Number(value) < next.minPrice)
        next.minPrice = Number(value);
      return next;
    });
  }

  function resetFilters() {
    setFilters(initialFilters);
  }

  function addToCart(game) {
    setCart((current) => {
      const existing = current.find((item) => item.id === game.id);
      if (existing) {
        return current.map((item) =>
          item.id === game.id
            ? { ...item, quantity: Math.min(item.quantity + 1, 5) }
            : item,
        );
      }
      return [...current, { ...game, quantity: 1 }];
    });
    notify(`${game.title} je dodat u korpu.`);
  }

  function toggleWishlist(game) {
    setWishlist((current) => {
      if (current.includes(game.id)) {
        notify(`${game.title} je uklonjen iz wishliste.`);
        return current.filter((id) => id !== game.id);
      }
      notify(`${game.title} je dodat u wishlistu.`);
      return [...current, game.id];
    });
  }

  function changeQuantity(id, delta) {
    setCart((current) =>
      current
        .map((item) =>
          item.id === id ? { ...item, quantity: item.quantity + delta } : item,
        )
        .filter((item) => item.quantity > 0 && item.quantity <= 5),
    );
  }

  function removeFromCart(id) {
    setCart((current) => current.filter((item) => item.id !== id));
  }

  const cartTotal = useMemo(
    () => cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [cart],
  );
  const cartCount = useMemo(
    () => cart.reduce((sum, item) => sum + item.quantity, 0),
    [cart],
  );
  const wishlistGames = useMemo(
    () => allGames.filter((game) => wishlist.includes(game.id)),
    [allGames, wishlist],
  );

  const value = useMemo(
    () => ({
      games,
      allGames,
      pagination,
      filters,
      options,
      loading,
      cart,
      cartTotal,
      cartCount,
      wishlist,
      wishlistGames,
      setFilters,
      setCart,
      updateFilter,
      resetFilters,
      addToCart,
      toggleWishlist,
      changeQuantity,
      removeFromCart,
    }),
    [
      cart,
      cartCount,
      cartTotal,
      filters,
      games,
      loading,
      options,
      pagination,
      wishlist,
      wishlistGames,
    ],
  );

  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
}

export function useShop() {
  const context = useContext(ShopContext);
  if (!context) {
    throw new Error("useShop mora biti koriscen unutar ShopProvider.");
  }
  return context;
}
