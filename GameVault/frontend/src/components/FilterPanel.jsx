import SelectField from "./SelectField.jsx";
import { money } from "../lib/format.js";

export default function FilterPanel({
  filters,
  options,
  updateFilter,
  resetFilters,
}) {
  return (
    <aside className="filter-panel">
      <div className="filter-header">
        <h2>Filteri</h2>
        <button className="ghost-button" onClick={resetFilters}>
          Reset
        </button>
      </div>

      <div className="field-group">
        <label>Pretraga</label>
        <input
          className="text-input"
          value={filters.search}
          placeholder="Naziv, žanr, opis..."
          onChange={(event) => updateFilter("search", event.target.value)}
        />
      </div>

      <SelectField
        label="Žanr"
        value={filters.genre}
        items={options.genres}
        onChange={(value) => updateFilter("genre", value)}
      />
      <SelectField
        label="Platforma"
        value={filters.platform}
        items={options.platforms}
        onChange={(value) => updateFilter("platform", value)}
      />
      <SelectField
        label="Launcher / port"
        value={filters.launcher}
        items={options.launchers}
        onChange={(value) => updateFilter("launcher", value)}
      />

      <div className="field-group">
        <label>Cena</label>
        <div className="price-row">
          <input
            className="number-input"
            type="number"
            min="0"
            max="200"
            value={filters.minPrice}
            onChange={(event) =>
              updateFilter(
                "minPrice",
                Math.max(0, Math.min(200, Number(event.target.value))),
              )
            }
          />
          <input
            className="number-input"
            type="number"
            min="0"
            max="200"
            value={filters.maxPrice}
            onChange={(event) =>
              updateFilter(
                "maxPrice",
                Math.max(0, Math.min(200, Number(event.target.value))),
              )
            }
          />
        </div>
        <input
          className="range-input"
          type="range"
          min="0"
          max="200"
          value={filters.maxPrice}
          onChange={(event) =>
            updateFilter("maxPrice", Number(event.target.value))
          }
        />
        <span className="auth-hint">
          {money(filters.minPrice)} - {money(filters.maxPrice)}
        </span>
      </div>
    </aside>
  );
}
