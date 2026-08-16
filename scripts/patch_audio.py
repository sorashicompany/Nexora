from pathlib import Path

path = Path('app/src/main/java/com/nexora/music/MainActivity.java')
s = path.read_text(encoding='utf-8')


def find_method(src, signature):
    start = src.find(signature)
    if start < 0:
        raise SystemExit(f'missing {signature}')
    brace = src.find('{', start)
    if brace < 0:
        raise SystemExit(f'missing opening brace for {signature}')
    depth = 0
    quote = None
    esc = False
    i = brace
    while i < len(src):
        c = src[i]
        if quote:
            if esc:
                esc = False
            elif c == '\\':
                esc = True
            elif c == quote:
                quote = None
        else:
            if c in ('"', "'"):
                quote = c
            elif c == '{':
                depth += 1
            elif c == '}':
                depth -= 1
                if depth == 0:
                    return start, i + 1
        i += 1
    raise SystemExit(f'unclosed {signature}')


def replace_method(src, signature, replacement):
    start, end = find_method(src, signature)
    return src[:start] + replacement + src[end:]

fields = '''  private Uri pendingAudioUri;
  private String pendingAudioName = "";
  private String pendingAudioMime = "";
  private String pendingAudioKind = "track";
  private TextView pendingAudioLabel;
  private EditText pendingAudioTitle, pendingAudioGenre, pendingAudioBpm, pendingAudioKey, pendingAudioDetune;
'''
if 'private Uri pendingAudioUri;' not in s:
    s = s.replace('  @Override protected void onCreate(Bundle b)', fields + '  @Override protected void onCreate(Bundle b)', 1)

load_tracks = '''  private void loadTracks(String id,boolean own){
    supabase.request("GET","/rest/v1/profiles?select=is_artist,is_beatmaker&id=eq."+id+"&limit=1",null,new SupabaseClient.Callback(){
      public void onSuccess(String profileJson){
        boolean artist=false,beatmaker=false;
        try{JsonArray pa=JsonParser.parseString(profileJson).getAsJsonArray();if(pa.size()>0){JsonObject p=pa.get(0).getAsJsonObject();artist=p.has("is_artist")&&!p.get("is_artist").isJsonNull()&&p.get("is_artist").getAsBoolean();beatmaker=p.has("is_beatmaker")&&!p.get("is_beatmaker").isJsonNull()&&p.get("is_beatmaker").getAsBoolean();}}catch(Exception ignored){}
        final boolean showTracks=artist,showBeats=beatmaker;
        supabase.request("GET","/rest/v1/creator_tracks?select=*&creator_id=eq."+id+"&order=created_at.desc&limit=100",null,new SupabaseClient.Callback(){
          public void onSuccess(String s){runOnUiThread(()->{try{
            JsonArray all=JsonParser.parseString(s).getAsJsonArray();
            JsonArray tracks=new JsonArray(),beats=new JsonArray();
            for(JsonElement e:all){JsonObject t=e.getAsJsonObject();if("beat".equalsIgnoreCase(val(t,"kind")))beats.add(t);else tracks.add(t);}
            boolean renderTracks=showTracks||(!showBeats&&tracks.size()>0);
            boolean renderBeats=showBeats||(!showTracks&&beats.size()>0);
            if(renderTracks){section("Треки");if(tracks.size()==0)content.addView(empty("Треков пока нет","Загрузи первый аудиофайл MP3 или WAV."));else for(JsonElement e:tracks)content.addView(trackCard(e.getAsJsonObject(),own));if(own){Button add=button("+ Добавить трек",CYAN);add.setTextColor(BG);add.setOnClickListener(v->addTrackKind("track"));content.addView(add,new LinearLayout.LayoutParams(-1,dp(48)));}}
            if(renderBeats){section("Биты");if(beats.size()==0)content.addView(empty("Битов пока нет","Загрузи первый бит в MP3 или WAV."));else for(JsonElement e:beats)content.addView(trackCard(e.getAsJsonObject(),own));if(own){Button add=button("+ Добавить бит",VIOLET);add.setTextColor(TEXT);add.setOnClickListener(v->addTrackKind("beat"));content.addView(add,new LinearLayout.LayoutParams(-1,dp(48)));}}
          }catch(Exception ignored){}});}public void onError(Exception e){}});
      }
      public void onError(Exception e){toast("Не удалось загрузить музыку");}
    });
  }'''
if 'private void loadTracks(String id,boolean own){' in s:
    s = replace_method(s, '  private void loadTracks(String id,boolean own){', load_tracks)

track_card = '''  private View trackCard(JsonObject t,boolean own){
    LinearLayout r=card();r.setPadding(dp(12),dp(12),dp(12),dp(12));
    TextView play=txt("▶",13,BG,true);play.setGravity(Gravity.CENTER);play.setBackground(round(CYAN,22));r.addView(play,new LinearLayout.LayoutParams(dp(44),dp(44)));
    LinearLayout c=new LinearLayout(this);c.setOrientation(LinearLayout.VERTICAL);c.setPadding(dp(12),0,0,0);
    c.addView(txt(val(t,"title"),15,TEXT,true));
    String meta=val(t,"genre");if(meta.isEmpty())meta="Без жанра";
    meta += " • " + ("beat".equalsIgnoreCase(val(t,"kind")) ? "Бит" : "Трек");
    if(t.has("bpm")&&!t.get("bpm").isJsonNull())meta += " • "+t.get("bpm").getAsInt()+" BPM";
    if(!val(t,"key_signature").isEmpty())meta += " • "+val(t,"key_signature");
    if(t.has("detune")&&!t.get("detune").isJsonNull())meta += " • detune "+val(t,"detune");
    c.addView(txt(meta,11,MUTED,false));c.addView(wave());
    r.addView(c,new LinearLayout.LayoutParams(0,-2,1));
    play.setOnClickListener(v->{String url=val(t,"audio_url");if(!url.isEmpty())try{startActivity(new Intent(Intent.ACTION_VIEW,Uri.parse(url)));}catch(Exception ignored){}});
    if(own){Button del=small("×",RED);del.setContentDescription("Удалить");del.setOnClickListener(v->confirmDeleteTrack(t));r.addView(del,new LinearLayout.LayoutParams(dp(42),dp(42)));}
    margin(r,0,0,0,8);return r;
  }'''
if 'private View trackCard(JsonObject t,boolean own){' in s:
    s = replace_method(s, '  private View trackCard(JsonObject t,boolean own){', track_card)
elif 'private View trackCard(JsonObject t){' in s:
    s = replace_method(s, '  private View trackCard(JsonObject t){', track_card)

add_track = '''  private void addTrack(){addTrackKind("track");}

  private void addTrackKind(String kind){
    pendingAudioKind=kind;pendingAudioUri=null;pendingAudioName="";pendingAudioMime="";
    LinearLayout f=form();
    pendingAudioTitle=field("Название","");pendingAudioGenre=field("Жанр","");pendingAudioKey=field("Тональность","");pendingAudioDetune=field("Детюн","");
    f.addView(pendingAudioTitle);f.addView(pendingAudioGenre);
    if("beat".equals(kind)){pendingAudioBpm=field("BPM","");f.addView(pendingAudioBpm);}else pendingAudioBpm=null;
    f.addView(pendingAudioKey);f.addView(pendingAudioDetune);
    Button pick=button("Выбрать аудиофайл",SURFACE2);f.addView(pick,new LinearLayout.LayoutParams(-1,dp(48)));
    pendingAudioLabel=txt("Файл не выбран • только MP3 / WAV • до 50 МБ",11,MUTED,false);pendingAudioLabel.setPadding(0,dp(8),0,dp(4));f.addView(pendingAudioLabel);
    pick.setOnClickListener(v->pickAudioFile());
    AlertDialog dialog=new AlertDialog.Builder(this).setTitle("Новый "+("beat".equals(kind)?"бит":"трек")).setView(f).setNegativeButton("Отмена",null).setPositiveButton("Загрузить",null).create();
    dialog.setOnShowListener(x->dialog.getButton(AlertDialog.BUTTON_POSITIVE).setOnClickListener(v->{if(pendingAudioUri==null){toast("Сначала выбери MP3 или WAV");return;}uploadPendingAudio(dialog);}));
    dialog.show();
  }

  private void pickAudioFile(){Intent i=new Intent(Intent.ACTION_OPEN_DOCUMENT);i.addCategory(Intent.CATEGORY_OPENABLE);i.setType("audio/*");startActivityForResult(i,1201);}

  @Override protected void onActivityResult(int requestCode,int resultCode,Intent data){super.onActivityResult(requestCode,resultCode,data);if(requestCode!=1201||resultCode!=RESULT_OK||data==null||data.getData()==null)return;Uri uri=data.getData();String name="audio";try{android.database.Cursor c=getContentResolver().query(uri,new String[]{android.provider.OpenableColumns.DISPLAY_NAME},null,null,null);if(c!=null){if(c.moveToFirst()&&!c.isNull(0))name=c.getString(0);c.close();}}catch(Exception ignored){}String mime=getContentResolver().getType(uri);if(!NexoraStorage.isSupportedAudio(name,mime)){toast("Разрешены только MP3 и WAV");return;}pendingAudioUri=uri;pendingAudioName=name;pendingAudioMime=mime==null?(name.toLowerCase(Locale.US).endsWith(".wav")?"audio/wav":"audio/mpeg"):mime;if(pendingAudioLabel!=null)pendingAudioLabel.setText(name+" • готов к загрузке");}

  private void uploadPendingAudio(AlertDialog dialog){
    String title=pendingAudioTitle.getText().toString().trim();String genre=pendingAudioGenre.getText().toString().trim();String key=pendingAudioKey.getText().toString().trim();String det=pendingAudioDetune.getText().toString().trim();
    if(title.isEmpty()){toast("Укажи название");return;}
    if("beat".equals(pendingAudioKind)&&(pendingAudioBpm==null||pendingAudioBpm.getText().toString().trim().isEmpty())){toast("Для бита укажи BPM");return;}
    String path=userId+"/"+UUID.randomUUID()+NexoraStorage.safeExtension(pendingAudioName);toast("Загрузка аудиофайла…");
    new NexoraStorage(this,BuildConfig.SUPABASE_URL,BuildConfig.SUPABASE_PUBLISHABLE_KEY,supabase.getAccessToken()).uploadAudio(pendingAudioUri,path,pendingAudioMime,new NexoraStorage.Callback(){
      public void onSuccess(String url){JsonObject b=new JsonObject();b.addProperty("creator_id",userId);b.addProperty("title",title);b.addProperty("genre",genre);b.addProperty("kind",pendingAudioKind);b.addProperty("audio_url",url);if(!key.isEmpty())b.addProperty("key_signature",key);if(!det.isEmpty())try{b.addProperty("detune",Double.parseDouble(det));}catch(Exception ignored){}if("beat".equals(pendingAudioKind))try{b.addProperty("bpm",Integer.parseInt(pendingAudioBpm.getText().toString().trim()));}catch(Exception ignored){}supabase.request("POST","/rest/v1/creator_tracks",b.toString(),new SupabaseClient.Callback(){public void onSuccess(String s){runOnUiThread(()->{dialog.dismiss();toast("Аудиофайл загружен");showProfile();});}public void onError(Exception e){toast("Файл загружен, но запись не сохранилась");}});}
      public void onError(Exception e){toast("Не удалось загрузить: "+e.getMessage());}
    });
  }

  private void confirmDeleteTrack(JsonObject track){new AlertDialog.Builder(this).setTitle("Удалить "+("beat".equalsIgnoreCase(val(track,"kind"))?"бит":"трек")+"?").setMessage("Файл аудио и запись в профиле будут удалены.").setNegativeButton("Отмена",null).setPositiveButton("Удалить",(d,w)->deleteTrack(track)).show();}
  private void deleteTrack(JsonObject track){String id=val(track,"id"),audio=val(track,"audio_url");Runnable deleteDb=()->supabase.request("DELETE","/rest/v1/creator_tracks?id=eq."+id,null,new SupabaseClient.Callback(){public void onSuccess(String s){runOnUiThread(()->{toast("Удалено");showProfile();});}public void onError(Exception e){toast("Не удалось удалить запись");}});if(audio.isEmpty()){deleteDb.run();return;}new NexoraStorage(this,BuildConfig.SUPABASE_URL,BuildConfig.SUPABASE_PUBLISHABLE_KEY,supabase.getAccessToken()).deletePublicAudio(audio,new NexoraStorage.Callback(){public void onSuccess(String x){deleteDb.run();}public void onError(Exception e){deleteDb.run();}});}
'''
if 'private void addTrackKind(String kind)' not in s:
    s = replace_method(s, '  private void addTrack(){', add_track)

s = s.replace('txt("v2.0.0",11,MUTED,false)', 'txt("v1.3.0",11,MUTED,false)')
path.write_text(s, encoding='utf-8')
