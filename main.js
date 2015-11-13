Importer.loadQtBinding( "qt.core" );
Importer.loadQtBinding( "qt.gui" );
Importer.loadQtBinding( "qt.uitools" );

Amarok.debug("script started");

function POIDbgWin()
{
	QMainWindow.call(this, null);
  var mainWidget = new QWidget( this );
	this.dbgList = new QListWidget(mainWidget);

	var explanationItem = new QListWidgetItem("This is just a debug console.");
  explanationItem.setFlags( !Qt.ItemIsSelectable );
  this.dbgList.addItem( explanationItem );
	this.dbgList.sizeHint = new QSize(900, 600);
  this.dbgList.size = new QSize(900, 600);
  this.dbgList.verticalScrollMode = QAbstractItemView.ScrollPerPixel;
  this.windowTitle = "Amarok Pause on Idle Debug";

	var layout = new QGridLayout( mainWidget );
  layout.addWidget( this.dbgList, 0, 0);
  mainWidget.setLayout( layout );
  this.setCentralWidget( mainWidget );
  this.resize(750, 400);

	this.show();
}

POIDbgWin.prototype = new QMainWindow();

dbgWin = new POIDbgWin();

function dbg(dbg_txt) {

	Amarok.debug(dbg_txt)

	aa = new QListWidgetItem(dbg_txt);

	dbgWin.dbgList.addItem(aa);
}

dbg("Ok, we've started!")
