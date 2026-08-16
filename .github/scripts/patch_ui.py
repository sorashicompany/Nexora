from pathlib import Path
p=Path('app/src/main/java/com/nexora/music/MainActivity.java')
s=p.read_text()
s=s.replace('dark=getPreferences(0).getBoolean("dark_theme",true);splash();}', 'dark=getPreferences(0).getBoolean("dark_theme",true);configureSystemBars();splash();}')
marker='  private void splash(){'
helper='''  private void configureSystemBars(){
    Window w=getWindow();
    w.setStatusBarColor(dark?BG:Color.rgb(246,248,251));
    w.setNavigationBarColor(dark?BG:Color.rgb(246,248,251));
    if(Build.VERSION.SDK_INT>=23)w.getDecorView().setSystemUiVisibility(dark?0:View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR);
  }
  private void applyTopInset(View root){
    final int l=root.getPaddingLeft(),t=root.getPaddingTop(),r=root.getPaddingRight(),b=root.getPaddingBottom();
    root.setOnApplyWindowInsetsListener((v,insets)->{int top=insets.getSystemWindowInsetTop();v.setPadding(l,t+top,r,b);return insets;});
    root.requestApplyInsets();
  }
'''
s=s.replace(marker,helper+marker)
s=s.replace('setContentView(r);animate(content);}', 'setContentView(r);applyTopInset(r);animate(content);}',1)
s=s.replace('c.addView(txt("↗",40,CYAN,true));','c.addView(txt("↓",40,CYAN,true));')
start=s.index('  private void showFavorite(){'); end=s.index('  private void showFriends(){',start)
newfav='''  private void showFavorite(){shell("Избранное",-1);content.addView(txt("Личные сохранённые сообщения",13,MUTED,false));
    ScrollView sc=new ScrollView(this);LinearLayout list=new LinearLayout(this);list.setOrientation(LinearLayout.VERTICAL);sc.addView(list);content.addView(sc,new LinearLayout.LayoutParams(-1,0,1));
    supabase.request("GET","/rest/v1/favorite_items?select=id,message_id,messages(body,created_at)&user_id=eq."+userId+"&order=created_at.desc",null,new SupabaseClient.Callback(){public void onSuccess(String s){runOnUiThread(()->{try{JsonArray a=JsonParser.parseString(s).getAsJsonArray();if(a.size()==0)list.addView(empty("Здесь пока пусто","Пиши сообщения здесь или сохраняй важное из чатов."));for(JsonElement e:a){JsonObject r=e.getAsJsonObject();JsonObject m=r.has("messages")&&!r.get("messages").isJsonNull()?r.getAsJsonObject("messages"):null;if(m!=null)list.addView(message(val(m,"body"),false));}}catch(Exception ignored){}});}public void onError(Exception e){runOnUiThread(()->list.addView(empty("Избранное пусто","Сохраняй важные сообщения.")));}});
    LinearLayout composer=new LinearLayout(this);composer.setGravity(Gravity.CENTER_VERTICAL);composer.setBackground(round(SURFACE,25));EditText e=input("Напиши себе сообщение...");ImageView send=new ImageView(this);send.setImageResource(R.drawable.ic_send);send.setPadding(dp(12),dp(12),dp(12),dp(12));send.setBackground(round(CYAN,22));composer.addView(e,new LinearLayout.LayoutParams(0,dp(50),1));composer.addView(send,new LinearLayout.LayoutParams(dp(50),dp(50)));content.addView(composer);
    send.setOnClickListener(v->{String body=e.getText().toString().trim();if(body.isEmpty())return;JsonObject b=new JsonObject();b.addProperty("user_id",userId);b.addProperty("body",body);supabase.request("POST","/rest/v1/favorite_items",b.toString(),new SupabaseClient.Callback(){public void onSuccess(String s){runOnUiThread(()->{e.setText("");list.addView(message(body,true));sc.post(()->sc.fullScroll(View.FOCUS_DOWN));});}public void onError(Exception x){toast("Не удалось сохранить сообщение");}});});
  }
'''
s=s[:start]+newfav+s[end:]
start=s.index('  private void showSearch(){'); end=s.index('  private void runSearch(',start)
newsearch='''  private void showSearch(){
    shell("Поиск",-2);
    content.removeAllViews();
    content.addView(txt("Поиск по Nexora",18,TEXT,true));
    content.addView(txt("@ пользователь  •  # тег  •  текст сообщения",12,MUTED,false));
    nav.removeAllViews();nav.setPadding(dp(8),dp(6),dp(8),dp(6));
    LinearLayout bar=new LinearLayout(this);bar.setGravity(Gravity.CENTER_VERTICAL);bar.setBackground(round(SURFACE2,25));
    EditText q=input("@user, #rock или сообщение");q.setTextSize(16);
    TextView close=txt("×",28,MUTED,true);close.setGravity(Gravity.CENTER);
    bar.addView(q,new LinearLayout.LayoutParams(0,dp(54),1));bar.addView(close,new LinearLayout.LayoutParams(dp(50),dp(54)));nav.addView(bar,new LinearLayout.LayoutParams(-1,dp(58)));
    close.setOnClickListener(v->{((InputMethodManager)getSystemService(INPUT_METHOD_SERVICE)).hideSoftInputFromWindow(q.getWindowToken(),0);showChats();});
    q.setOnEditorActionListener((v,a,e)->{runSearch(q.getText().toString().trim());return true;});
    q.addTextChangedListener(new android.text.TextWatcher(){public void beforeTextChanged(CharSequence s,int a,int b,int c){}public void onTextChanged(CharSequence s,int a,int b,int c){runSearch(s.toString().trim());}public void afterTextChanged(android.text.Editable e){}});
    q.requestFocus();q.postDelayed(()->((InputMethodManager)getSystemService(INPUT_METHOD_SERVICE)).showSoftInput(q,InputMethodManager.SHOW_IMPLICIT),160);
  }
'''
s=s[:start]+newsearch+s[end:]
start=s.index('  private void showSettings(){'); end=s.index('  private void profileTypeSettings(){',start)
newsettings='''  private void showSettings(){
    showShell("Настройки",2);
    content.addView(txt("NEXORA • STUDIO",11,CYAN,true));
    sectionTitle("Профиль");
    settingButton("Настройки профиля","Имя, username, о себе, Telegram-канал и другие сервисы",v->profileSettings());
    settingButton("Музыкальные сервисы","SoundCloud, Spotify, Яндекс Музыка, BeatChain",v->serviceSettings());
    sectionTitle("Оформление");
    LinearLayout theme=settingRow("Тёмная тема","Сохраняется на устройстве");
    Switch sw=new Switch(this);sw.setChecked(dark);sw.setOnCheckedChangeListener((b,c)->{dark=c;getPreferences(0).edit().putBoolean("dark_theme",c).apply();configureSystemBars();showSettings();});theme.addView(sw,new LinearLayout.LayoutParams(-2,-2));content.addView(theme);
    sectionTitle("Приватность");
    settingButton("Приватность","Уведомления, видимость профиля, скрытые разделы и понравившаяся музыка",v->privacyDialog());
    sectionTitle("Тип профиля");
    content.addView(profileTypeSelector());
    sectionTitle("Аккаунт");
    settingButton("Очистить кэш","Удалить локальные временные данные",v->{getPreferences(MODE_PRIVATE).edit().clear().apply();toast("Кэш очищен");});
    Button out=button("Выйти из аккаунта",Color.rgb(65,28,40));out.setTextColor(Color.rgb(255,110,130));out.setOnClickListener(v->{supabase.signOut();showWelcome();});content.addView(out,new LinearLayout.LayoutParams(-1,dp(50)));
    Button del=button("Удалить аккаунт",Color.rgb(55,25,30));del.setTextColor(RED);del.setOnClickListener(v->confirmDelete());content.addView(del,new LinearLayout.LayoutParams(-1,dp(50)));
  }
'''
s=s[:start]+newsettings+s[end:]
p.write_text(s)
