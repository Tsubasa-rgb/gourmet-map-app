import React, { useState } from "react";

function Header( {onOpenRouletteModal, onLocate, onToggleAddMode, addMode, onOpenGenreModal, onOpenOptions, onOpenList, searchWord, setSearchWord, suggestions, onSelectSuggestion, onOpenGuide} ) {
    const [menuOpen, setMenuOpen] = useState(false);

    return (
        <header style={styles.header}>
            {/*左側*/}
            <div style={styles.left}>
                <button style={styles.menuButton} onClick={() => setMenuOpen(prev => !prev)}>
                    ☰ 
                </button>

                <div style={styles.title}>🍽️グルメマップ</div>

                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginLeft: "10px" }}>
                    <button
                        style={styles.button}
                        onClick={() => onOpenOptions(prev => !prev)}
                    >
                        フィルター
                    </button>

                    <button
                        style={styles.button}
                        onClick={onOpenList}
                    >
                        リスト表示
                    </button>

                    <div style={{ position: "relative" }}>
                        <input
                            type="text"
                            placeholder="🔍 店名で検索"
                            value={searchWord}
                            onChange={(e) => setSearchWord(e.target.value)}
                            style={{
                                padding: "6px 12px",
                                borderRadius: "20px",
                                border: "1px solid #ccc",
                                width: "180px",
                            }}
                        />

                        {/* サジェスト */}
                        {suggestions.length > 0 && (
                            <div 
                                style={{
                                    position: "absolute",
                                    top: "35px",
                                    left: 0,
                                    width: "100%",
                                    background: "white",
                                    border: "1px solid #ddd",
                                    borderRadius: "8px",
                                    boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
                                    zIndex: 2000,
                                }}
                            >
                                {suggestions.map((shop, index) => (
                                    <div
                                        key={index}
                                        style={{
                                            padding: "8px",
                                            cursor: "pointer",
                                            borderBottom: "1px solid #eee",
                                        }}
                                        onClick={() => onSelectSuggestion(shop)}
                                    >
                                        <div style={{ fontWeight: "bold",fontSize: "12px", color: "#666" }}>{shop.name}</div>
                                        <div style={{ fontSize: "10px", color: "#666" }}>
                                            {shop.genre}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/*右側*/}
            <div style={styles.right}>
                <button 
                    style={{
                        ...styles.button,
                        backgroundColor: addMode ? "#4caf50" : "#fff",
                        color: addMode ? "white" : "#333",
                    }}
                    onClick={onToggleAddMode}
                >
                    {addMode ? "追加モードON" : "追加モードOFF"}
                </button>

                <button style={styles.button} onClick={onLocate}>
                    📍 現在地
                </button>

                <button style={styles.button} onClick={onOpenRouletteModal}>
                    🎲 ルーレット
                </button>

                <button style={styles.button} onClick={() => alert("訪問回数、最終訪問日を基にしたランキング機能を実装予定")}>
                    🏆 ランキング
                </button>
            </div>

            {/*メニュー*/}
            {menuOpen && (
                <div style={styles.dropdown}>
                    <button style={styles.menuItem} onClick={onOpenGenreModal}>
                        ジャンル管理
                    </button>
                    <button style={styles.menuItem} onClick={onOpenGuide}>
                        使い方ガイド
                    </button>
                    {/*今後の項目はここに追加*/ }
                </div>
            )}
        </header>
    );
}


const styles = {
  header: {
    width: "100vw",
    padding: "15px",
    backgroundColor: "#ff7043",
    color: "white",
    fontWeight: "bold",
    fontSize: "20px",
    boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
    position: "sticky",
    top: 0,
    zIndex: 2000,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    margin: 0,
    fontSize: "30px",
    whiteSpace: "nowrap",
  },
  menuButton: {
    fontSize: "25px",
    background: "none",
    border: "none",
    color: "white",
    cursor: "pointer",
  },
  dropdown: {
    position: "absolute",
    top: "60px",
    left: "10px",
    background: "white",
    color: "#333",
    borderRadius: "6px",
    boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
    zIndex: 3000,
  },
  menuItem: {
    display: "block",
    padding: "10px 20px",
    border: "none",
    background: "none",
    width: "100%",
    textAlign: "left",
    cursor: "pointer",
    fontSize: "15px"
  },
  button: {
    marginLeft: "10px",
    padding: "5px 10px",
  },
  left: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    flexShrink: 0,
  },

  right: {
    display: "flex",
    alignItems: "center",
    flexShrink: 0,
    marginRight: "30px",
  },
};



export default Header;