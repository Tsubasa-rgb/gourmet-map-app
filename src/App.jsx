import { useState, useRef, useEffect } from "react";
import { GoogleMap, LoadScript, Marker, InfoWindow } from "@react-google-maps/api";
import Header from "./Header.jsx";
import Roulette from "./Roulette.jsx";
import Guide from "./Guide.jsx";

// =============================================
// 定数
// =============================================

const DEFAULT_CENTER = { lat: 35.6812, lng: 139.7671 }; // 東京

const VISIT_LEVELS = ["行きつけ", "よく行く", "そこそこ", "行った", "行きたい"];

const DEFAULT_GENRES = [{ name: "未分類", color: "gray" }];

const GENRE_COLOR_OPTIONS = [
  { value: "red",    label: "赤" },
  { value: "blue",   label: "青" },
  { value: "green",  label: "緑" },
  { value: "yellow", label: "黄" },
  { value: "purple", label: "紫" },
];

// =============================================
// App
// =============================================

function App() {

  // ---------- 初期読み込み ----------
  const [isLoaded, setIsLoaded] = useState(false);

  // ---------- 地図 ----------
  const mapRef = useRef(null);
  const [currentPos, setCurrentPos] = useState(null);

  // ---------- 店舗データ ----------
  const [shops, setShops] = useState([]);

  // ---------- 店追加モード ----------
  const [addMode, setAddMode]           = useState(false);
  const [selectedPos, setSelectedPos]   = useState(null);
  const [inputName, setInputName]       = useState("");
  const [selectedGenre, setSelectedGenre] = useState("");
  const [visitLevel, setVisitLevel]     = useState("");

  // ---------- チェックイン ----------
  const [checkedIn, setCheckedIn] = useState(false);

  // ---------- ジャンル ----------
  const [genres, setGenres]                         = useState(DEFAULT_GENRES);
  const [newGenre, setNewGenre]                     = useState("");
  const [newGenreColor, setNewGenreColor]           = useState("red");
  const [genreModalOpen, setGenreModalOpen]         = useState(false);
  const [createGenreModalOpen, setCreateGenreModalOpen] = useState(false);

  // ---------- フィルタ ----------
  const [optionsOpen, setOptionsOpen]               = useState(false);
  const [selectedGenreOption, setSelectedGenreOption] = useState("");
  const [selectedVisitLevels, setSelectedVisitLevels] = useState([]);

  // ---------- 店リスト ----------
  const [listModalOpen, setListModalOpen] = useState(false);

  // ---------- 検索 ----------
  const [searchWord, setSearchWord]   = useState("");
  const [suggestions, setSuggestions] = useState([]);

  // ---------- ホバー ----------
  const [hoveredShop, setHoveredShop] = useState(null);

  // ---------- ルーレット ----------
  const [rouletteModalOpen, setRouletteModalOpen] = useState(false);

  // ---------- 使い方ガイド ----------
  const [guideModalOpen, setGuideModalOpen] = useState(false);


  // =============================================
  // 初期化 & 永続化
  // =============================================

  // 起動時に localStorage から読み込む
  useEffect(() => {
    const savedShops  = localStorage.getItem("shops");
    const savedGenres = localStorage.getItem("genres");
    if (savedShops)  setShops(JSON.parse(savedShops));
    if (savedGenres) setGenres(JSON.parse(savedGenres));
    setIsLoaded(true);
  }, []);

  // 店・ジャンルが変わるたびに保存
  useEffect(() => {
    if (!isLoaded) return;
    localStorage.setItem("shops",  JSON.stringify(shops));
    localStorage.setItem("genres", JSON.stringify(genres));
  }, [shops, genres]);


  // =============================================
  // 現在地
  // =============================================

  const applyCurrentPosition = (pos) => {
    setCurrentPos(pos);
    if (mapRef.current) {
      mapRef.current.panTo(pos);
      mapRef.current.setZoom(16);
    }
  };

  const handleGeolocationSuccess = (position) => {
    const pos = {
      lat: position.coords.latitude,
      lng: position.coords.longitude,
    };
    applyCurrentPosition(pos);
  };

  // 起動時に位置情報を取得
  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      handleGeolocationSuccess,
      () => console.log("位置情報取得失敗 → 東京を表示"),
    );
  }, []);

  // ボタン押下で現在地へ移動
  const moveToCurrentLocation = () => {
    if (!navigator.geolocation) { alert("位置情報が使えません"); return; }
    if (!mapRef.current)        { alert("地図がまだ読み込まれていません"); return; }
    navigator.geolocation.getCurrentPosition(
      handleGeolocationSuccess,
      () => alert("位置情報の取得に失敗しました"),
    );
  };


  // =============================================
  // ジャンル
  // =============================================

  const handleCreateGenre = () => {
    if (!newGenre) return;
    setGenres(prev => [...prev, { name: newGenre, color: newGenreColor }]);
    setNewGenre("");
    setCreateGenreModalOpen(false);
  };

  const handleDeleteGenre = (genreName) => {
    if (genreName === "未分類") return;
    setGenres(prev => prev.filter(g => g.name !== genreName));
    setShops(prev =>
      prev.map(shop =>
        shop.genre === genreName ? { ...shop, genre: "未分類", color: "gray" } : shop
      )
    );
  };


  // =============================================
  // 店舗操作
  // =============================================

  const handleAddShop = () => {
    if (!inputName) return;

    const finalGenre = selectedGenre || "未分類";
    const matched    = genres.find(g => g.name === finalGenre);

    setShops(prev => [
      ...prev,
      {
        name:       inputName,
        lat:        selectedPos.lat,
        lng:        selectedPos.lng,
        genre:      finalGenre,
        visitLevel: visitLevel,
        color:      matched?.color || "gray",
      },
    ]);

    setSelectedPos(null);
    setInputName("");
    setSelectedGenre("");
  };

  const handleCheckIn = () => {
    const now = new Date().toISOString();

    setShops(prev =>
      prev.map(shop =>
        shop.lat === selectedPos.lat && shop.lng === selectedPos.lng
          ? { ...shop, count: (shop.count || 0) + 1, lastVisited: now }
          : shop
      )
    );

    setSelectedPos(prev => ({
      ...prev,
      count:       (prev.count || 0) + 1,
      lastVisited: now,
    }));

    setCheckedIn(true);
  };

  const handleDeleteShop = () => {
    setShops(prev =>
      prev.filter(shop => !(shop.lat === selectedPos.lat && shop.lng === selectedPos.lng))
    );
    setSelectedPos(null);
    setCheckedIn(false);
  };

  const handleCloseShopModal = () => {
    setSelectedPos(null);
    setCheckedIn(false);
  };


  // =============================================
  // フィルタ & 検索
  // =============================================

  const toggleVisitLevel = (level) => {
    setSelectedVisitLevels(prev =>
      prev.includes(level) ? prev.filter(l => l !== level) : [...prev, level]
    );
  };

  const filteredShops = shops.filter(shop => {
    const genreMatch  = !selectedGenreOption || shop.genre === selectedGenreOption;
    const levelMatch  = selectedVisitLevels.length === 0 || selectedVisitLevels.includes(shop.visitLevel);
    const searchMatch = !searchWord || shop.name.toLowerCase().includes(searchWord.toLowerCase());
    return genreMatch && levelMatch && searchMatch;
  });

  useEffect(() => {
    if (!searchWord) { setSuggestions([]); return; }
    setSuggestions(
      shops.filter(shop => shop.name.toLowerCase().includes(searchWord.toLowerCase())).slice(0, 5)
    );
  }, [searchWord, shops]);

  const handleSelectSuggestion = (shop) => {
    setSearchWord(shop.name);
    setSuggestions([]);
    setSelectedPos(shop);
    if (mapRef.current) {
      mapRef.current.panTo({ lat: shop.lat, lng: shop.lng });
      mapRef.current.setZoom(17);
    }
  };


  // =============================================
  // マップ設定
  // =============================================

  const mapOptions = {
    styles: addMode
      ? []
      : [{ featureType: "poi", stylers: [{ visibility: "off" }] }],
  };

  const getModeMessage = () => {
    if (addMode)           return "📍 追加モード：追加したい場所をクリック";
    if (shops.length === 0) return "📭 閲覧モード：お店がありません。追加モードから追加してください";
    return "👀 閲覧モード：ピンをクリックしてお店情報を表示";
  };

  const handleMapClick = (e) => {
    if (!addMode) return;
    setSelectedPos({ lat: e.latLng.lat(), lng: e.latLng.lng() });
    setInputName("");
  };

  const handleMarkerClick = (shop) => {
    if (addMode) return;
    setSelectedPos({
      lat:        shop.lat,
      lng:        shop.lng,
      name:       shop.name,
      genre:      shop.genre,
      visitLevel: shop.visitLevel,
      count:      shop.count || 0,
      lastVisited: shop.lastVisited || null,
    });
    setInputName(shop.name);
  };


  // =============================================
  // レンダリング
  // =============================================

  return (
    <LoadScript googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>

      <Header
        onLocate={moveToCurrentLocation}
        onToggleAddMode={() => setAddMode(prev => !prev)}
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

      {/* モードバナー */}
      <div style={styles.modeBanner}>
        {getModeMessage()}
      </div>

      {/* 地図 */}
      <GoogleMap
        onLoad={(map) => (mapRef.current = map)}
        mapContainerStyle={{ width: "100%", height: "calc(100vh - 60px)" }}
        center={DEFAULT_CENTER}
        zoom={13}
        options={mapOptions}
        onClick={handleMapClick}
      >
        {/* 現在地マーカー */}
        {currentPos && (
          <Marker
            position={currentPos}
            icon={{
              path:          window.google.maps.SymbolPath.CIRCLE,
              scale:         9,
              fillColor:     "#4285F4",
              fillOpacity:   1,
              strokeColor:   "white",
              strokeWeight:  3,
            }}
          />
        )}

        {/* 店舗マーカー */}
        {filteredShops.map((shop, index) => (
          <Marker
            key={index}
            position={{ lat: shop.lat, lng: shop.lng }}
            title={shop.name}
            onMouseOver={() => setHoveredShop(shop)}
            onMouseOut={() => setHoveredShop(null)}
            onClick={() => handleMarkerClick(shop)}
            icon={{
              path:         "M0-20c-10 0-18 8-18 18 0 12 18 32 18 32s18-20 18-32c0-10-8-18-18-18z",
              scale:        0.6,
              fillColor:    shop.color,
              fillOpacity:  1,
              strokeColor:  "white",
              strokeWeight: 2,
              anchor:       new window.google.maps.Point(0, 10),
            }}
          />
        ))}

        {/* ホバー時に店名表示 */}
        {hoveredShop && (
          <InfoWindow
            position={{ lat: hoveredShop.lat, lng: hoveredShop.lng }}
            onCloseClick={() => setHoveredShop(null)}
          >
            <div>
              <strong>{hoveredShop.name}</strong>
              <div style={{ fontSize: "12px" }}>{hoveredShop.genre}</div>
            </div>
          </InfoWindow>
        )}
      </GoogleMap>


      {/* ===== お店追加 / 閲覧モーダル ===== */}
      {selectedPos && (
        <div style={styles.overlay} onClick={handleCloseShopModal}>
          <div style={styles.modal} onClick={e => e.stopPropagation()}>

            {addMode ? (
              /* 追加フォーム */
              <>
                <h3>お店を追加</h3>

                <input
                  placeholder="店名"
                  value={inputName}
                  onChange={e => setInputName(e.target.value)}
                  style={styles.input}
                />

                <select
                  value={selectedGenre}
                  onChange={e => setSelectedGenre(e.target.value)}
                  style={styles.input}
                >
                  <option value="">ジャンルを選択</option>
                  {genres.map((g, i) => (
                    <option key={i} value={g.name}>{g.name}</option>
                  ))}
                </select>

                <p style={styles.helpText}>
                  ※メイン画面左上メニュー内の「ジャンル管理」から追加できます。
                </p>

                <div style={styles.levelContainer}>
                  {VISIT_LEVELS.map(level => (
                    <button
                      key={level}
                      onClick={() => setVisitLevel(level)}
                      style={{
                        ...styles.levelButton,
                        backgroundColor: visitLevel === level ? "#4caf50" : "#eee",
                        color:           visitLevel === level ? "white"   : "black",
                      }}
                    >
                      {level}
                    </button>
                  ))}
                </div>

                <div style={{ display: "flex", gap: "10px" }}>
                  <button style={styles.addButton}    onClick={handleAddShop}>追加</button>
                  <button style={styles.cancelButton} onClick={() => setSelectedPos(null)}>キャンセル</button>
                </div>
              </>
            ) : (
              /* 閲覧パネル */
              <>
                <button style={styles.closeButton} onClick={handleCloseShopModal}>×</button>

                <h2 style={{ marginTop: "20px" }}>{selectedPos.name}</h2>
                <h5 style={{ margin: "4px 0" }}>ジャンル：{selectedPos.genre || "未分類"}</h5>
                <h5 style={{ margin: "4px 0" }}>訪問レベル：{selectedPos.visitLevel}</h5>
                <p>訪問回数：{selectedPos.count || 0}回</p>
                <p>
                  最終訪問日：
                  {selectedPos.lastVisited
                    ? new Date(selectedPos.lastVisited).toLocaleDateString()
                    : "未訪問"}
                </p>

                <div style={{ position: "relative", marginTop: "10px", height: "40px" }}>
                  <button
                    style={{
                      ...styles.checkInButton,
                      backgroundColor: checkedIn ? "#ccc" : "#4caf50",
                      cursor:          checkedIn ? "not-allowed" : "pointer",
                    }}
                    disabled={checkedIn}
                    onClick={handleCheckIn}
                  >
                    {checkedIn ? "チェックイン済み" : "📍 チェックイン"}
                  </button>

                  <button
                    style={{ ...styles.deleteButtonOnlyWord, position: "absolute", right: 0, bottom: 0 }}
                    onClick={handleDeleteShop}
                  >
                    削除
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}


      {/* ===== フィルターモーダル ===== */}
      {optionsOpen && (
        <div style={styles.overlay} onClick={() => setOptionsOpen(false)}>
          <div style={styles.modal} onClick={e => e.stopPropagation()}>
            <button style={styles.closeButton} onClick={() => setOptionsOpen(false)}>×</button>

            <h3 style={{ marginTop: "30px" }}>表示するお店を選択</h3>

            <h4 style={{ margin: "16px 0 6px" }}>ジャンル</h4>
            <select
              value={selectedGenreOption}
              onChange={e => setSelectedGenreOption(e.target.value)}
              style={{ width: "100%", padding: "6px", marginBottom: "12px" }}
            >
              <option value="">すべて</option>
              {genres.map(g => (
                <option key={g.name} value={g.name}>{g.name}</option>
              ))}
            </select>

            <h4 style={{ margin: "16px 0 6px" }}>訪問レベル</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              {VISIT_LEVELS.map(level => (
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

            <button style={styles.button} onClick={() => setOptionsOpen(false)}>決定</button>
          </div>
        </div>
      )}


      {/* ===== ジャンル作成モーダル ===== */}
      {createGenreModalOpen && (
        <div
          style={{ ...styles.overlay, zIndex: 3000 }}
          onClick={() => setCreateGenreModalOpen(false)}
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
              onChange={e => setNewGenreColor(e.target.value)}
              style={styles.input}
            >
              {GENRE_COLOR_OPTIONS.map(({ value, label }) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>

            <div style={{ display: "flex", gap: "10px" }}>
              <button onClick={handleCreateGenre}>作成</button>
              <button onClick={() => setCreateGenreModalOpen(false)}>キャンセル</button>
            </div>
          </div>
        </div>
      )}


      {/* ===== ジャンル管理モーダル ===== */}
      {genreModalOpen && (
        <div style={styles.overlay} onClick={() => setGenreModalOpen(false)}>
          <div style={styles.modal} onClick={e => e.stopPropagation()}>
            <button style={styles.closeButton} onClick={() => setGenreModalOpen(false)}>×</button>

            <h3>ジャンル管理</h3>

            <div style={styles.genreList}>
              {genres.map((g, i) => (
                <div key={i} style={styles.genreItem}>
                  <span>{g.name}</span>
                  <button
                    style={{
                      ...styles.deleteButtonOnlyWord,
                      color:  g.name === "未分類" ? "#aaa" : "#f44336",
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
              style={styles.createGenreButton}
              onClick={() => setCreateGenreModalOpen(true)}
            >
              ＋ ジャンルを作成
            </button>
          </div>
        </div>
      )}


      {/* ===== 店リストモーダル ===== */}
      {listModalOpen && (
        <div style={styles.overlay} onClick={() => setListModalOpen(false)}>
          <div style={styles.modal} onClick={e => e.stopPropagation()}>
            <button style={styles.closeButton} onClick={() => setListModalOpen(false)}>×</button>

            <h3>リスト表示</h3>

            <div style={{ maxHeight: "300px", overflowY: "auto" }}>
              {[...filteredShops]
                .sort((a, b) => a.name.localeCompare(b.name, "ja"))
                .map((shop, index) => (
                  <div
                    key={index}
                    style={{ padding: "8px", borderBottom: "1px solid #eee", cursor: "pointer" }}
                    onClick={() => {
                      setAddMode(false);
                      setSelectedPos(shop);
                      setListModalOpen(false);
                      if (mapRef.current) {
                        mapRef.current.panTo({ lat: shop.lat, lng: shop.lng });
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


      {/* ===== ルーレットモーダル ===== */}
      {rouletteModalOpen && (
        <Roulette
          genres={genres}
          shops={shops}
          onClose={() => setRouletteModalOpen(false)}
        />
      )}

      {/* ===== 使い方ガイドモーダル ===== */}
      {guideModalOpen && (
        <Guide onClose={() => setGuideModalOpen(false)} />
      )}

      {/* フッター */}
      <footer style={styles.footer}>
        © 2026 Takai Tsubasa
      </footer>

    </LoadScript>
  );
}

export default App;


// =============================================
// スタイル
// =============================================

const styles = {
  overlay: {
    position:        "fixed",
    top:             0,
    left:            0,
    width:           "100%",
    height:          "100%",
    backgroundColor: "rgba(0,0,0,0.4)",
    display:         "flex",
    justifyContent:  "center",
    alignItems:      "center",
    zIndex:          2000,
  },
  modal: {
    position:     "relative",
    background:   "white",
    padding:      "20px",
    borderRadius: "12px",
    width:        "300px",
    boxShadow:    "0 5px 20px rgba(0,0,0,0.3)",
  },
  closeButton: {
    position:   "absolute",
    top:        "10px",
    right:      "10px",
    background: "none",
    border:     "none",
    fontSize:   "30px",
    cursor:     "pointer",
    color:      "#666",
  },
  input: {
    width:        "100%",
    padding:      "8px",
    marginBottom: "10px",
  },
  helpText: {
    fontSize:     "10px",
    color:        "#666",
    marginTop:    "-5px",
    marginBottom: "10px",
  },
  levelContainer: {
    display:      "flex",
    gap:          "5px",
    overflowX:    "auto",
    whiteSpace:   "nowrap",
    marginBottom: "10px",
  },
  levelButton: {
    flex:         "1 1 30%",
    padding:      "8px",
    border:       "none",
    borderRadius: "6px",
    cursor:       "pointer",
  },
  addButton: {
    flex:            1,
    backgroundColor: "#4caf50",
    color:           "white",
    border:          "none",
    padding:         "10px",
    borderRadius:    "6px",
  },
  cancelButton: {
    flex:            1,
    backgroundColor: "#ccc",
    border:          "none",
    padding:         "10px",
    borderRadius:    "6px",
  },
  checkInButton: {
    padding:         "8px 32px",
    backgroundColor: "#4caf50",
    color:           "white",
    border:          "none",
    borderRadius:    "8px",
    fontSize:        "16px",
    fontWeight:      "bold",
    cursor:          "pointer",
  },
  deleteButtonOnlyWord: {
    background: "none",
    color:      "#f44336",
    border:     "none",
    fontSize:   "12px",
    cursor:     "pointer",
  },
  modeBanner: {
    position:        "absolute",
    top:             "70px",
    left:            "50%",
    transform:       "translateX(-50%)",
    backgroundColor: "#333",
    color:           "white",
    padding:         "8px 16px",
    borderRadius:    "20px",
    fontSize:        "14px",
    zIndex:          1000,
    opacity:         0.9,
  },
  genreList: {
    maxHeight:    "200px",
    overflowY:    "auto",
    marginTop:    "10px",
    border:       "1px solid #ddd",
    borderRadius: "6px",
  },
  genreItem: {
    display:        "flex",
    justifyContent: "space-between",
    alignItems:     "center",
    padding:        "8px",
    borderBottom:   "1px solid #eee",
  },
  createGenreButton: {
    marginTop:       "10px",
    width:           "100%",
    padding:         "12px",
    backgroundColor: "#ff7043",
    color:           "white",
    border:          "none",
    borderRadius:    "8px",
    fontSize:        "16px",
    fontWeight:      "bold",
    cursor:          "pointer",
  },
  footer: {
    position:        "absolute",
    bottom:          "10px",
    left:            "10px",
    background:      "rgba(255,255,255,0.85)",
    padding:         "4px 8px",
    borderRadius:    "8px",
    fontSize:        "12px",
    color:           "#333",
    zIndex:          1000,
  },
};
