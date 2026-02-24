import React from "react";

export default function CategoryBar({ categories, selected, onSelect }) {
  return (
    <div className="category-bar">
      <button className={selected === "" ? "active" : ""} onClick={() => onSelect("")}>All</button>
      {categories.map((category) => (
        <button
          key={category}
          className={selected === category ? "active" : ""}
          onClick={() => onSelect(category)}
        >
          {category}
        </button>
      ))}
    </div>
  );
}
