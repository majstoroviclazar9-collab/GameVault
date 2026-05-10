export default function SelectField({ label, value, items, onChange }) {
  return (
    <div className="field-group">
      <label>{label}</label>
      <select
        className="select-input"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        <option value="">Sve</option>
        {items.map((item) => (
          <option key={item} value={item}>
            {item}
          </option>
        ))}
      </select>
    </div>
  );
}
