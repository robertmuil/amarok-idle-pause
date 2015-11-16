Importer.loadQtBinding( "qt.core" );
Importer.loadQtBinding( "qt.gui" );
Importer.loadQtBinding( "qt.uitools" );

Amarok.debug("script started");

SecondsUntilPause = 2*60*60; //1 hour

secondsUntilPause = SecondsUntilPause;

function POIDbgWin()
{
	QMainWindow.call(this, null);
  var mainWidget = new QWidget( this );
	this.dbgList = new QListWidget(mainWidget);

//	this.dbgList.rowsInserted.connect(this.dbgList.scrollToBottom);

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
	dbgWin.dbgList.scrollToBottom();

	Amarok.Window.Statusbar.shortMessage("POIDbg: " + dbg_txt);

}

function timedAlert(interval) {
	var qo = new QTimer();
	qo.timeout.connect(function(qevent) {
		secondsUntilPause -= 1;
		msg = 'Time-out: ' + secondsUntilPause + ' seconds until pause.';
		dbg(msg)

		if (secondsUntilPause <= 0) {
			Amarok.Engine.Pause();
			msg = 'Have been idle for '+SecondsUntilPause+' seconds: playback paused.';
			dbg(msg);
			Amarok.alert(msg);
			qo.stop(); //shouldn' this be 'this' or something?
		}

		return true;
	})
	qo.start(interval);

	return qo
}

function resetTimer() {
	secondsUntilPause = SecondsUntilPause;
	timerObj.start()
}

function tracks()
{
	dbg(Amarok.Playlist.totalTrackCount() + " tracks in playlist");
	resetTimer();
}

Amarok.Playlist.trackInserted.connect(tracks);
Amarok.Playlist.trackRemoved.connect(tracks);

currentSeekPos = 0;
Amarok.Engine.trackPlayPause.connect(function(isPause) {
	//the trackPlayPause event is called whenever the engine pauses or plays,
	//including when the track advances automatically to the next in the playlist.
	//ie it's not a good indication of user activity.
	msg = 'trackPlayPause event: ' + isPause + ': '
	if (isPause) {
		msg += 'pause';
		//this should only occur on manual action or on our own action
		timerObj.stop()
	} else {
		//this occurs also when the track changes in the playlist
		msg+='play';

		timerIsRunning = timerObj.active;
		if (!timerIsRunning) {
			dbg('timer was not running, activating.')
			resetTimer();
		}
	}
	dbg(msg);
	return true;
});

Amarok.Engine.trackChanged.connect(function() {
	currentSeekPos = 0;
	dbg('trackChanged()');
});

Amarok.Engine.trackSeeked.connect(function(seekPos) {
	//This is fired for ANY movement of a track, even just normal playing.
	//so this will be useful for idle detection only if we maintain a counter
	//and detect non-normal playback
	if (seekPos < currentSeekPos) {
		dbg('trackSeeked('+seekPos+') went backward');
		resetTimer();
	}
	currentSeekPos = seekPos;
});
Amarok.Engine.volumeChanged.connect(function(vol) {
	dbg('volumeChanged('+vol+')');
	resetTimer();
});
Amarok.Engine.trackFinished.connect(function() {
	// Doesn't seem to fire when track reaches end and next is immediately played
	dbg('trackFinished()');
});

dbg("Ok, we've started!")

timerObj = timedAlert(1000);
