import { useState, useRef, useEffect } from "react";
import { GoogleMap, LoadScript, Marker, InfoWindow } from "@react-google-maps/api";
import Header from "./Header.jsx";
import Roulette from "./Roulette.jsx";
import Guide from "./Guide.jsx";

//マップ初期位置：東京
const center = {
  lat: 35.6812,
  lng: 139.7671,
};

function App() {
  // ==================== < 状態 > ====================
  // ============= 初期読み込み判定 ==================
  const [isLoaded, setIsLoaded] = useState(false);

  // ==================== 現在地 ====================
  const [currentPos, setCurrentPos] = useState(null);

  // ==================== 店舗データ ====================
  const [shops, setShops] = useState([]);

  // ==================== 店追加モード ====================
  const [addMode, setAddMode] = useState(false);
  const [selectedPos, setSelectedPos] = useState(null);
  const [inputName, setInputName] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("");
  const [visitLevel, setVisitLevel] = useState("");

  // ================= チェックイン判定 =================
  const [checkedIn, setCheckedIn] = useState(false);

  // ==================== ジャンル ====================
  const [genres, setGenres] = useState([
    { name: "未分類", color: "gray" }
  ]);
  const [createGenreModalOpen, setCreateGenreModalOpen] = useState(false);//ジャンル作成モーダル
  const [newGenre, setNewGenre] = useState("");
  const [newGenreColor, setNewGenreColor] = useState("red");
  const [genreModalOpen, setGenreModalOpen] = useState(false);//ジャンル管理モーダル

  // ==================== フィルタ ====================
  const [optionsOpen, setOptionsOpen] = useState(false); 
  const [selectedGenreOption, setSelectedGenreOption] = useState(""); // 選択されたジャンル
  const [selectedVisitLevels, setSelectedVisitLevels] = useState([]); // 選択された訪問レベル

  // ===================== 店リスト =====================
  const [listModalOpen, setListModalOpen] = useState(false);

  // ===================== 検索 ======================
  const [searchWord, setSearchWord] = useState("");
  const [suggestions, setSuggestions] = useState([]);

  // =================== ホバー判定 ====================
  const [hoveredShop, setHoveredShop] = useState(null);

  // ==================== ルーレット ====================
  const [rouletteModalOpen, setRouletteModalOpen] = useState(false);

  // ================== 使い方ガイド =====================
  const [guideModalOpen, setGuideModalOpen] = useState(false);

  // =================== < 関数 > ===================
  // ================ 起動時店, ジャンル読み込み ================
  useEffect(() => {
    const savedShops = localStorage.getItem("shops");
    const savedGenres = localStorage.getItem("genres");
    if (savedShops) {
      setShops(JSON.parse(savedShops));
    }
    if (savedGenres) {
      setGenres(JSON.parse(savedGenres));
    }
    setIsLoaded(true);
  }, []);
  // ================ 店, ジャンル情報が変わるたび保存 ============
  useEffect(() => {
    if (!isLoaded) return;

    localStorage.setItem("shops", JSON.stringify(shops));
    localStorage.setItem("genres", JSON.stringify(genres));
  }, [shops, genres]);
  // ==================== ジャンル ====================
  const handleOpenCreateGenreModal = () => setCreateGenreModalOpen(true);
  const handleCloseCreateGenreModal = () => setCreateGenreModalOpen(false);

  const handleCreateGenre = () => {
    if (!newGenre) return;
    setGenres(prev => [
      ...prev, 
      { name: newGenre, color: newGenreColor }
    ]);
    setNewGenre("");
    setCreateGenreModalOpen(false);
  }

  //ジャンル削除関数
  const handleDeleteGenre = (genreName) => {
    if (genreName === "未分類") return;

    setGenres(prev => prev.filter(g => g.name !== genreName));

    setShops(prev =>
      prev.map(shop =>
        shop.genre === genreName
          ? { ...shop, genre: "未分類", color: "gray" }
          : shop
      )
    );
  };

  // ==================== 店追加モード ====================
  const toggleAddMode = () => {
    setAddMode((prev) => !prev);
  };

  // =============== モードメッセージ ===============
  const getModeMessage = () => {
    if (addMode) {
      return "📍 追加モード：追加したい場所をクリック";
    }

    if (shops.length === 0) {
      return "📭 閲覧モード：お店がありません。追加モードから追加してください";
    }

    return "👀 閲覧モード：ピンをクリックしてお店情報を表示";
  };

  // ==================== マップ設定 ====================
  const mapOptions = {
    styles: addMode
      ? [] // ← 表示する
      : [
        {
          featureType: "poi",
          stylers: [{ visibility: "off" }],
        },
        ],
  };

  // ==================== 店舗操作 ====================
  const addShop = () => {
    if (!name || !lat || !lng) return;

    const newShop = {
      name,
      lat: parseFloat(lat),
      lng: parseFloat(lng),
    };

    setShops([...shops, newShop]);

    setName("");
    setLat("");
    setLng("");
  };

  //==================== お店チェックイン =================
  const checkInShop = (lat, lng) => {
    const now = new Date().toISOString();

    setShops(prev =>
      prev.map(shop =>
        shop.lat === lat && shop.lng === lng
          ? {
              ...shop,
              count: (shop.count || 0) + 1,
              lastVisited: now,
            }
          : shop
      )
    );

    setSelectedPos(prev => ({
      ...prev,
      count: (prev.count || 0) + 1,
      lastVisited: now,
    }));
  };

  // ==================== フィルタ ====================
  const toggleGenre = (genre) => {
    setSelectedGenres(prev =>
      prev.includes(genre) ? prev.filter(g => g!==genre) : [...prev, genre]
    );
  };

  const toggleVisitLevel = (level) => {
    setSelectedVisitLevels(prev =>
      prev.includes(level) ? prev.filter(l => l !== level) : [...prev, level]
    );
  };

  const filterShops = shops.filter(shop => {
    const genreMatch =
      !selectedGenreOption || shop.genre === selectedGenreOption;

    const levelMatch =
      selectedVisitLevels.length === 0 ||
      selectedVisitLevels.includes(shop.visitLevel);

    const searchMatch =
      !searchWord ||
      shop.name.toLowerCase().includes(searchWord.toLowerCase());

    return genreMatch && levelMatch && searchMatch;
  });

  // ============== 検索サジェスト ===================
  useEffect(() => {
    if (!searchWord) {
      setSuggestions([]);
      return;
    }

    const filtered = shops.filter(shop =>
      shop.name.toLowerCase().includes(searchWord.toLowerCase())
    );

    setSuggestions(filtered.slice(0, 5));
  }, [searchWord, shops]);

  //クリック時ズーム
  const handleSelectSuggestion = (shop) => {
    setSearchWord(shop.name);
    setSuggestions([]);

    setSelectedPos(shop);

    if (mapRef.current) {
      mapRef.current.panTo({
        lat: shop.lat,
        lng: shop.lng,
      });
      mapRef.current.setZoom(17);
    }
  };

  // ==================== 現在地 ====================
  const mapRef = useRef(null);

  const moveToCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("位置情報が使えません");
      return;
    }

    if (!mapRef.current) {
      alert("地図がまだ読み込まれていません");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position)=> {
        const pos = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };

        setCurrentPos(pos);

        mapRef.current.panTo(pos);
        mapRef.current.setZoom(16);
      },
      () => {
        alert("位置情報の取得に失敗しました")
      }
    );
  };

  useEffect(() => {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const pos = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };

        setCurrentPos(pos);

        if (mapRef.current) {
          mapRef.current.panTo(pos);
          mapRef.current.setZoom(16);
        }
      },
      () => {
        console.log("位置情報取得失敗 → 東京を表示");
      }
    );
  }, []);

  return (
    <LoadScript googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
      <Header
        onLocate={moveToCurrentLocation}
        onToggleAddMode={toggleAddMode}
        addMode={addMode}
        onOpenGenreModal={() => setGenreModalOpen(true)}
        onOpenRouletteModal={() => setRouletteModalOpen(true)}
        onOpenOptions={setOptionsOpen}
        onOpenList={() => setListModalOpen(true)}
        searchWord={searchWord}
        setSearchWord={setSearchWord}
        suggestions={suggestions}
        onSelectSuggestion={handleSelectSuggestion}
        onOpenGuide={() => setGuideModalOpen(true)}
      />
      
      {/*バナー*/}
      <div style={styles.modeBanner}>
        {getModeMessage()}
      </div>

      {/* 地図 */}
      <GoogleMap
        onLoad={(map) => (mapRef.current = map)}
        mapContainerStyle={{ width: "100%", height: "calc(100vh - 60px)", /*marginTop: "10px"*/ }}
        center={center}
        zoom={13}
        options={mapOptions}
        onClick={(e) => {
          if(!addMode) return;

          const lat = e.latLng.lat();
          const lng = e.latLng.lng();

          setSelectedPos({ lat, lng });
          setInputName("");//初期化
        }}
        >
        
        {currentPos && (
          <Marker
            position={currentPos}
            icon={{
              path: window.google.maps.SymbolPath.CIRCLE,
              scale: 9,                 
              fillColor: "#4285F4",     
              fillOpacity: 1,
              strokeColor: "white",     
              strokeWeight: 3,          
            }}
          />
        )}

        {filterShops.map((shop, index) => (
          <>
            <Marker
              key={index}
              position={{ lat: shop.lat, lng: shop.lng }}
              title={shop.name}

              onMouseOver={() => setHoveredShop(shop)}
              onMouseOut={() => setHoveredShop(null)}

              icon={{
                path: "M0-20c-10 0-18 8-18 18 0 12 18 32 18 32s18-20 18-32c0-10-8-18-18-18z",
                scale: 8,
                fillColor: shop.color,
                fillOpacity: 1,
                strokeColor: "white",
                strokeWeight: 2,
                scale: 0.6,
                anchor: new window.google.maps.Point(0, 10),
              }}
              onClick={() => {
                if (addMode) return;
                setSelectedPos({ lat: shop.lat, lng: shop.lng, name: shop.name, genre: shop.genre, visitLevel: shop.visitLevel, count: shop.count || 0, lastVisited: shop.lastVisited || null });
                setInputName(shop.name);
              }}
            />
          </>
        ))}

        {/*ホバーで店名表示*/}
        {hoveredShop && (
          <InfoWindow
            position={{ lat: hoveredShop.lat, lng: hoveredShop.lng }}
            onCloseClick={() => setHoveredShop(null)}
          >
            <div>
              <strong>{hoveredShop.name}</strong>
              <div style={{ fontSize: "12px" }}>
                {hoveredShop.genre}
              </div>
            </div>
          </InfoWindow>
        )}

      </GoogleMap>

      {/*お店追加、閲覧モーダル*/}
      {selectedPos && (
        <div
          style={styles.overlay}
          onClick={() => {
            setSelectedPos(null)
            setCheckedIn(false);
          }} //外クリックで閉じる
        >
          <div
            style={styles.modal}
            onClick={(e) => e.stopPropagation()} //モーダル内クリックは無効化
          >
            {addMode ? (
              <>
                <h3>お店を追加</h3>

                <input
                  placeholder="店名"
                  value={inputName}
                  onChange={(e) => setInputName(e.target.value)}
                  style={styles.input}
                />

                <select
                  value={selectedGenre}
                  onChange={(e) => setSelectedGenre(e.target.value)}
                  style={styles.input}
                >
                  <option value="">ジャンルを選択</option>
                  {genres.map((g, i) => (
                    <option key={i} value={g.name}>
                      {g.name}
                    </option>
                  ))}
                </select>

                <p style={styles.helpText}>※メイン画面左上メニュー内の 「ジャンル管理」 から追加できます。</p>

                <div style={styles.levelContainer}>
                  {["行きつけ", "よく行く", "そこそこ", "行った", "行きたい"].map((level) => (
                    <button
                      key={level}
                      onClick={() => setVisitLevel(level)}
                      style={{
                        ...styles.levelButton,
                        backgroundColor: visitLevel === level ? "#4caf50" : "#eee",
                        color: visitLevel === level ? "white" : "black",
                      }}
                    >
                      {level}
                    </button>
                  ))}
                </div>

                <div style={{ display: "flex", gap: "10px" }}>
                  <button
                    style={styles.addButton}
                    onClick={() => {
                      if (!inputName) return;

                      const finalGenre = selectedGenre || "未分類";
                      const selected = genres.find(g => g.name === finalGenre);

                      setShops((prev) => [
                        ...prev,
                        {
                          name: inputName,
                          lat: selectedPos.lat,
                          lng: selectedPos.lng,
                          genre: selectedGenre,
                          visitLevel: visitLevel,
                          color: selected?.color || "gray",
                        },
                      ]);

                      setSelectedPos(null);
                      setInputName("");
                      setSelectedGenre("");
                    }}
                  >
                    追加
                  </button>

                  <button
                    style={styles.cancelButton}
                    onClick={() => setSelectedPos(null)}
                  >
                    キャンセル
                  </button>
                </div>
              </>
            ) : (
              <>
                <button
                  style={styles.closeButton}
                  onClick={() => {
                    setSelectedPos(null);
                    setCheckedIn(false);
                  }}
                >
                  ×
                </button>
                <h2 style={{ marginTop: "20px" }}>{selectedPos.name}</h2>
                <h5 style={{ margin: "4px 0" }}>ジャンル：{selectedPos.genre || "未分類" }</h5>
                <h5 style={{ margin: "4px 0" }}>訪問レベル：{selectedPos.visitLevel}</h5>
                <p>訪問回数：{selectedPos.count || 0}回</p>
                <p>最終訪問日：
                  {selectedPos.lastVisited
                    ? new Date(selectedPos.lastVisited).toLocaleDateString()
                    : "未訪問"
                  }
                </p>
                <div style={{ position: "relative", marginTop: "10px", height: "40px" }}>
                  <button
                    style={{
                      ...styles.checkInButton,
                      backgroundColor: checkedIn ? "#ccc" : "#4caf50",
                      cursor: checkedIn ? "not-allowed" : "pointer",
                    }}
                    disabled={checkedIn}
                    onClick={() => {
                      checkInShop(selectedPos.lat, selectedPos.lng);
                      setCheckedIn(true);
                    }}
                  >
                    {checkedIn ? "チェックイン済み" : "📍 チェックイン"}
                  </button>
                  <button
                    style={{
                      ...styles.deleteButtonOnlyWord,
                      position: "absolute",
                      right: "0",
                      bottom: "0",
                    }}
                    onClick={() => {
                      setShops(prev => prev.filter(
                        shop => !(shop.lat === selectedPos.lat && shop.lng === selectedPos.lng)
                      ));
                      setSelectedPos(null);
                      setCheckedIn(false);
                    }}
                  >
                    削除
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/*フィルターモーダル*/}
      {optionsOpen && (
        <div style={styles.overlay} onClick={() => setOptionsOpen(false)}>
            <div style={styles.modal} onClick={e => e.stopPropagation()}>
              <button
              style={styles.closeButton}
              onClick={() => setOptionsOpen(false)}
              >
                ×
              </button>
              <h3 style={{ marginTop: "30px" }}>表示するお店を選択</h3>

              <h4 style={{ margin: "16px 0 6px" }}>ジャンル</h4>
              <select
                value={selectedGenreOption}
                onChange={(e) => setSelectedGenreOption(e.target.value)}
                style={{ width: "100%", padding: "6px", marginBottom: "12px" }}
              >
                <option value="">すべて</option>
                {genres.map((g) => (
                  <option key={g.name} value={g.name}>{g.name}</option>
                ))}
              </select>

              <h4 style={{ margin: "16px 0 6px" }}>訪問レベル</h4>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                {["行きつけ", "よく行く", "そこそこ", "行った", "行きたい"].map((level) => (
                  <label key={level} style={{ display: "block" }}>
                    <input
                      type="checkbox"
                      checked={selectedVisitLevels.includes(level)}
                      onChange={() => toggleVisitLevel(level)}
                    />
                    {level}
                  </label>
                ))}
              </div>

              <button style={styles.button} onClick={() => setOptionsOpen(false)}>
                決定
              </button>
            </div>
        </div>
      )}

      {/*ジャンル作成モーダル*/}
      {createGenreModalOpen && (
        <div 
          style={{ ...styles.overlay, zIndex: 3000 }}
          onClick={handleCloseCreateGenreModal}
        >
          <div style={styles.modal} onClick={e => e.stopPropagation()}>
            <h3>ジャンルを作成</h3>
            <input
              placeholder="ジャンル名"
              value={newGenre}
              onChange={e => setNewGenre(e.target.value)}
              style={styles.input}
            />
            <select
              value={newGenreColor}
              onChange={(e) => setNewGenreColor(e.target.value)}
              style={styles.input}
            >
              <option value="red">赤</option>
              <option value="blue">青</option>
              <option value="green">緑</option>
              <option value="yellow">黄</option>
              <option value="purple">紫</option>
            </select>
            <div style={{ display: "flex", gap: "10px" }}>
              <button onClick={handleCreateGenre}>作成</button>
              <button onClick={handleCloseCreateGenreModal}>キャンセル</button>
            </div>
          </div>
        </div>
      )}

      {/*ジャンル管理モーダル*/}
      {genreModalOpen && (
        <div
          style={styles.overlay}
          onClick={() => setGenreModalOpen(false)}
        >
          <div
            style={styles.modal}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              style={styles.closeButton}
              onClick={() => setGenreModalOpen(false)}
            >
              ×
            </button>
            <h3>ジャンル管理</h3>

            <div style={styles.genreList}>
              {genres.map((g, i) => (
                <div key={i} style={styles.genreItem}>
                  <span>{g.name}</span>
                  <button 
                    style={{
                      ...styles.deleteButtonOnlyWord,
                      color: g.name === "未分類" ? "#aaa" : "#f44336",
                      cursor: g.name === "未分類" ? "not-allowed" : "pointer",
                    }}
                    disabled={g.name === "未分類"}
                    onClick={() => handleDeleteGenre(g.name)}
                  >
                    削除
                  </button>
                </div>
              ))}
            </div>

            <button
              style={ styles.createGenreButton }
              onClick={handleOpenCreateGenreModal}
            >
              ＋ ジャンルを作成
            </button>
          </div>
        </div>
      )}

      {/*お店リスト表示*/}
      {listModalOpen && (
        <div style={styles.overlay} onClick={() => setListModalOpen(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <button
              style={styles.closeButton}
              onClick={() => setListModalOpen(false)}
            >
              ×
            </button>

            <h3>リスト表示</h3>

            <div style={{ maxHeight: "300px", overflowY: "auto" }}>
              {[...filterShops]
                .sort((a, b) => a.name.localeCompare(b.name, "ja"))
                .map((shop, index) => (
                  <div
                    key={index}
                    style={{
                      padding: "8px",
                      borderBottom: "1px solid #eee",
                      cursor: "pointer",
                    }}
                    onClick={() => {
                      setAddMode(false);
                      setSelectedPos(shop);
                      setListModalOpen(false);

                      if (mapRef.current) {
                        mapRef.current.panTo({
                          lat: shop.lat,
                          lng: shop.lng,
                        });
                        mapRef.current.setZoom(16);
                      }
                    }}
                  >
                    <div style={{ fontWeight: "bold" }}>{shop.name}</div>
                    <div style={{ fontSize: "12px", color: "#666" }}>
                      {shop.genre || "未分類"} / {shop.visitLevel}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}
      
      {/*ルーレットモーダル*/}
      {rouletteModalOpen && (
        <Roulette
          genres={genres}
          shops={shops}
          onClose={() => setRouletteModalOpen(false)}
        />
      )}

      {/*使い方ガイドモーダル*/}
      {guideModalOpen && (
        <Guide onClose={() => setGuideModalOpen(false)}/>
      )}

      <footer
        style={{
          position: "absolute",
          bottom: "10px",
          left: "10px",
          background: "rgba(255,255,255,0.85)",
          padding: "4px 8px",
          borderRadius: "8px",
          fontSize: "12px",
          color: "#333",
          zIndex: 1000,
        }}
      >
        © 2026 Takai Tsubasa
      </footer>
    </LoadScript>
  );
}

export default App;

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
    boxShadow: "0 5px 20px rgba(0,0,0,0.3)",
  },
  input: {
    width: "100%",
    padding: "8px",
    marginBottom: "10px",
  },
  addButton: {
    flex: 1,
    backgroundColor: "#4caf50",
    color: "white",
    border: "none",
    padding: "10px",
    borderRadius: "6px",
  },
  cancelButton: {
    flex: 1,
    backgroundColor: "#ccc",
    border: "none",
    padding: "10px",
    borderRadius: "6px",
  },
  helpText: {
    fontSize: "10px",   
    color: "#666",       
    marginTop: "-5px",     
    marginBottom: "10px",
  },
  levelContainer: {
  display: "flex",
  gap: "5px",
  overflowX: "auto",
  whiteSpace: "nowrap",
  marginBottom: "10px",
  },
  levelButton: {
    flex: "1 1 30%",
    padding: "8px",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
  },
  deleteButton: {
    flex: 1,
    backgroundColor: "#f44336",
    color: "white",
    border: "none",
    padding: "10px",
    borderRadius: "6px",
  },
  modeBanner: {
    position: "absolute",
    top: "70px",
    left: "50%",
    transform: "translateX(-50%)",
    backgroundColor: "#333",
    color: "white",
    padding: "8px 16px",
    borderRadius: "20px",
    fontSize: "14px",
    zIndex: 1000,
    opacity: 0.9,
  },
  genreList: {
    maxHeight: "200px",
    overflowY: "auto",
    marginTop: "10px",
    border: "1px solid #ddd",
    borderRadius: "6px",
  },
  genreItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "8px",
    borderBottom: "1px solid #eee",
  },
  deleteButtonOnlyWord: {
    background: "none",
    color: "#f44336",
    border: "none",
    fontSize: "12px",
    cursor: "pointer",
  },
  closeButton: {
    position: "absolute",
    top: "10px",
    right: "10px",
    background: "none",
    border: "none",
    fontSize: "30px",
    cursor: "pointer",
    color: "#666",
  },
  createGenreButton: {
    marginTop: "10px",
    width: "100%",
    padding: "12px",
    backgroundColor: "#ff7043",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontSize: "16px",
    fontWeight: "bold",
    cursor: "pointer",
  },
  checkInButton: {
    padding: "8px 32px",
    backgroundColor: "#4caf50",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontSize: "16px",
    fontWeight: "bold",
    cursor: "pointer",
  },
};