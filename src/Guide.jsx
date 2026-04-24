function Guide({ onClose }) {
  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button style={styles.closeButton} onClick={onClose}>
          ×
        </button>
        <h3>📗 使い方ガイド</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        
        <div>
            <h4 style={{ marginBottom: "6px" }}>① 現在地に移動する</h4>
            <p style={styles.text}>
                ヘッダー右上の「📍現在地」ボタンを押すことで、現在地に移動できます。
            </p>
        </div>

        <div>
            <h4 style={{ marginBottom: "6px" }}>② お店のジャンルを作成する</h4>
            <p style={styles.text}>
                ヘッダー左上の「☰」を押し、「ジャンル管理」をクリックするとジャンル管理モーダルが表示されます。
            </p>
            <p style={styles.text}>
                「＋ジャンルを作成」ボタンを押し、ジャンル名とピンの色を選択して作成できます。
            </p>
            <p style={styles.text}>
                また、ジャンル管理モーダル内の削除をクリックすることでジャンルを削除することもできます。
            </p>
        </div>

        <div>
            <h4 style={{ marginBottom: "6px" }}>③ マップ表示のモード</h4>

            <p style={styles.text}>
                マップには「📭 閲覧モード」と「📍 追加モード」の2種類があります。
            </p>

            <p style={styles.text}>
                📭 閲覧モード：登録したお店の情報を確認、チェックインを行うことができます。
            </p>

            <p style={styles.text}>
                📍 追加モード：マップをクリックしてお店を追加することができます。
            </p>

            <p style={styles.text}>
                ヘッダー右上の「追加モード ON/OFF」ボタンでモードを切り替えできます。
                （緑：追加モード／白：閲覧モード）
            </p>
        </div>

        <div>
            <h4 style={{ marginBottom: "6px" }}>④ お店を追加する</h4>

            <p style={styles.text}>
                「📍 追加モード」に切り替え、マップ上の追加したい場所をクリックすると、お店追加モーダルが表示されます。
            </p>

            <p style={styles.text}>
                店名を入力し、ジャンルと訪問レベル（行きつけ／よく行く／そこそこ／行った／行きたい）を選択して、「追加」ボタンを押すとお店を登録できます。
            </p>

            <p style={styles.text}>
                ※ジャンルを選択しない場合は「未分類」として登録されます。
            </p>
        </div>

        <div>
            <h4 style={{ marginBottom: "6px" }}>⑤ お店情報の確認とチェックイン</h4>

            <p style={styles.text}>
                「📭 閲覧モード」に切り替え、登録したお店をクリックするとお店情報が表示されます。
            </p>

            <p style={styles.text}>
                ジャンル、訪問レベル、訪問回数、最終訪問日を確認できます。
            </p>

            <p style={styles.text}>
                「📍 チェックイン」ボタンを押すと、訪問回数が1回増え、最終訪問日が更新されます。
            </p>

            <p style={styles.text}>
                ※右下の「削除」ボタンからお店を削除することもできます。
            </p>
        </div>

       <div>
            <h4 style={{ marginBottom: "6px" }}>⑥ お店の検索機能</h4>

            <p style={styles.text}>
                ヘッダーの「フィルター」「リスト表示」「🔍検索」を使うことで、登録したお店を効率よく探すことができます。
            </p>

            <p style={styles.text}>
                フィルター：ジャンルや訪問レベルを指定して、表示するお店を絞り込めます。
            </p>

            <p style={styles.text}>
                リスト表示：お店を一覧で確認できます。フィルター条件も適用され、店名をクリックするとその位置へ移動します。
            </p>

            <p style={styles.text}>
                🔍検索：店名を入力すると、候補が表示され、選択するとそのお店に移動します。
            </p>
        </div>

        <div>
            <h4 style={{ marginBottom: "6px" }}>⑦ ルーレット機能</h4>

            <p style={styles.text}>
                ルーレット機能を使うと、ジャンルやお店をランダムに決定できます。
            </p>

            <p style={styles.text}>
                ヘッダー右上の「🎲 ルーレット」ボタンを押すと、ルーレットモーダルが表示されます。
            </p>

            <p style={styles.text}>
                ルーレットは「ジャンル抽選 → お店抽選」の順で進みます。
            </p>

            <p style={styles.text}>
                【ジャンル抽選】<br />
                ・詳細設定から抽選対象のジャンルを選択できます。<br />
                ・「ジャンルを決める」ボタンを押すと抽選が始まり、ジャンルが決定されます。
            </p>

            <p style={styles.text}>
                【お店抽選】<br />
                ・「お店を決める」ボタンを押すと、選ばれたジャンルの中からお店が決定されます。
            </p>

            <p style={styles.text}>
                ※「もう一度ジャンル抽選をする」を押すと、再度ジャンル抽選ができます。<br />
                ※「×」ボタンで途中終了することもできます。
            </p>
        </div>

        <div>
            <h4 style={{ marginBottom: "6px" }}>⑧ ランキング機能</h4>

            <p style={styles.text}>
                訪問回数、最終訪問日を基にしたランキング機能を実装予定です。
            </p>
        </div>

        </div>
        </div>
    </div>
  );
}

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
    zIndex: 3000,
  },
  modal: {
    position: "relative",
    background: "white",
    padding: "30px",
    borderRadius: "12px",
    width: "850px",
    maxHeight: "80vh",
    overflowY: "auto",
  },
  closeButton: {
    position: "absolute",
    top: "10px",
    right: "10px",
    background: "none",
    border: "none",
    fontSize: "24px",
    cursor: "pointer",
  },
  text: {
    fontSize: "17px",
    color: "#555",
    lineHeight: "1.5",
    margin: "2px 0",
  },
};

export default Guide;