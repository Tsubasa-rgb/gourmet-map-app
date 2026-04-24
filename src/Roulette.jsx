import { useState, useEffect } from "react";

function Roulette({ genres, onClose, shops }) {
  const [showDetails, setShowDetails] = useState(false); // 詳細設定の表示/非表示
  const [rouletteGenres, setRouletteGenres] = useState(genres.map(g => g.name));//ルーレットの抽選対象のジャンル
  const [isRolling, setRolling] = useState(false);
  const [genreResult, setGenreResult] = useState("");
  const [shopResult, setShopResult] = useState("");

  // ジャンルルーレット
  const startGenreRoulette = () => {
    if (rouletteGenres.length === 0) {
      alert("ジャンルを1つ以上選んでください");
      return;
    }

    setRolling(true);
    setGenreResult("");

    setTimeout(() => {
      const random = rouletteGenres[Math.floor(Math.random() * rouletteGenres.length)];
      setGenreResult(random);
      setRolling(false);
    }, 2000);
  };

  // お店ルーレット
  const pickShop = () => {
    const candidates = shops.filter(shop => shop.genre === genreResult);
    if (candidates.length === 0) {
      alert("該当ジャンルのお店がありません");
      return;
    }

    setRolling(true);
    setShopResult("");

    setTimeout(() => {
      const randomShop = candidates[Math.floor(Math.random() * candidates.length)];
      setShopResult(randomShop.name);
      setRolling(false);
    }, 2000)
};

  //抽選中は詳細設定閉じる
  useEffect(() => {
    if (isRolling) setShowDetails(false);
  }, [isRolling]);

  const checkAll = () => setRouletteGenres(genres.map(g => g.name));
  const uncheckAll = () => setRouletteGenres([]);

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
         <button
          style={styles.closeButton}
          onClick={onClose}
        >
              ×
        </button>

        <h3>ルーレット</h3>

        {/* 詳細設定を開くボタン */}
        {!isRolling && !genreResult && (
          <p
            style={{
              color: "#1E90FF",
              cursor: "pointer",
              margin: "10px 0",
              fontSize: "16px"
            }}
            onClick={() => setShowDetails((prev) => !prev)}
          >
            詳細設定 {showDetails ? "▲" : "▼"}
          </p>
        )}

        {/* 詳細設定（チェックボックス） */}
        {showDetails && !isRolling && !genreResult && (
          <div>
            <div style={styles.genreContainer}>
              {genres.map((genre) => (
                <label key={genre.name} style={styles.genreLabel}>
                  <input
                    type="checkbox"
                    value={genre.name}
                    checked={rouletteGenres.includes(genre.name)}
                    onChange={(e) => {
                      const value = e.target.value;
                      setRouletteGenres((prev) =>
                        prev.includes(value)
                          ? prev.filter((g) => g !== value)
                          : [...prev, value]
                      );
                    }}
                  />
                  {genre.name}
                </label>
              ))}
            </div>
            <div style={styles.detailButtons}>
              <button style={styles.smallButton} onClick={checkAll}>すべてチェック</button>
              <button style={styles.smallButton} onClick={uncheckAll}>すべて解除</button>
            </div>
          </div>
        )}


        {/* 初期状態 */}
        {!isRolling && !genreResult && (
          <>
            <button style={styles.rouletteButton} onClick={startGenreRoulette}>
              🎲 ジャンルを決める
            </button>
          </>
        )}

        {/* 回転中 */}
        {isRolling && (
          <div style={{ textAlign: "center" }}>
            <img
              src="/image.png"
              alt="rolling"
              style={{ width: "100px" }}
            />
            <p>抽選中...</p>
          </div>
        )}

        {/* 結果 */}
        {!isRolling && genreResult && !shopResult &&(
          <div style={{ textAlign: "center" }}>
            <h2>🎯 {genreResult}</h2>
            <p style={{ margin: "4px 0" }}>に決定！</p>

            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0px", marginTop: "10px" }}>
              <button
                style={{
                  ...styles.buttonOnlyWord,
                  color: "red",
                  padding: "10px 24px",
                }}
                onClick={startGenreRoulette}
              >
                もう１回ジャンル抽選をする
              </button>

              <button
                style={{
                  ...styles.rouletteButton,
                  padding: "10px 30px",
                }}
                onClick={pickShop}
              >
                🎲 お店を決める
              </button>

              <p
                style={{
                  fontSize: "12px",
                  color: "#555",
                  lineHeight: "0.2",
                  marginTop: "0px",
                  textAlign: "center",
                }}
              >
                ※{genreResult}の中からお店が決定されます
              </p>
            </div>
          </div>
        )}
        {/* 抽選結果表示 */}
        {shopResult && (
          <div style={{ textAlign: "center" }}>
            <h2>🎯 {shopResult}</h2>
            <p style={{ margin: "4px 0" }}>に決定！</p>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0px", marginTop: "10px" }}>
              <button
                style={{
                  ...styles.buttonOnlyWord,
                  color: "red",
                  padding: "10px 24px",
                }}
                onClick={pickShop}
              >
                もう１回お店抽選をする
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Roulette;

const styles = {
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0,0,0,0.4)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 2000,
  },
  modal: {
    position: "relative",
    background: "white",
    padding: "20px",
    borderRadius: "12px",
    width: "300px",
  },
  button: {
    width: "100%",
    marginBottom: "10px",
    padding: "10px",
  },
  cancel: {
    width: "100%",
    padding: "10px",
    borderRadius: "6px",
  },
  closeButton: {
    position: "absolute",
    top: "10px",
    right: "10px",
    zIndex: 10,
    background: "none",
    border: "none",
    fontSize: "30px",
    cursor: "pointer",
    color: "#666",
  },
  rouletteButton: {
    padding: "11px 48px",      
    backgroundColor: "#4caf50",
    color: "white",
    border: "none",
    borderRadius: "12px",
    fontSize: "20px",          
    fontWeight: "bold",
    cursor: "pointer",
    display: "block",       
    margin: "15px auto",         
  },
  smallButton: {
    flex: 1,
    margin: "0 4px",
    padding: "2px 6px",
    fontSize: "14px",
    borderRadius: "8px",
    border: "1px solid #4caf50",
    backgroundColor: "#fff",
    color: "#4caf50",
    cursor: "pointer",
  },
  buttonOnlyWord: {
    background: "none",
    border: "none",
    fontSize: "12px",
    cursor: "pointer",
  },
  genreContainer: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "8px",          
    maxHeight: "100px",      
    overflowY: "auto",     
    padding: "5px",
    border: "1px solid #ddd",
    borderRadius: "8px",
  },
  genreLabel: {
    display: "flex",
    alignItems: "center",
    gap: "5px",
  },
};