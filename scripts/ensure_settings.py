from pathlib import Path

TARGET = Path('app/src/main/java/com/nexora/music/MainActivity.java')
s = TARGET.read_text(encoding='utf-8')


def replace_method(src, signature, replacement):
    start = src.find(signature)
    if start < 0:
        raise SystemExit(f'missing {signature}')
    brace = src.find('{', start)
    if brace < 0:
        raise SystemExit(f'missing body for {signature}')
    depth = 0
    for i in range(brace, len(src)):
        if src[i] == '{':
            depth += 1
        elif src[i] == '}':
            depth -= 1
            if depth == 0:
                return src[:start] + replacement + src[i + 1:]
    raise SystemExit(f'unclosed {signature}')


def remove_method(src, signature):
    while signature in src:
        src = replace_method(src, signature, '')
    return src

# The build runs this after patch_android_ui.py. Remove the previous settings
# implementations so this file is idempotent and remains safe on repeated builds.
for sig in [
    'private void showSettings()',
    'private void profileSettings()',
    'private void profileDialog(',
    'private void serviceSettings()',
    'private void editService(',
    'private void privacyDialog()',
    'private void confirmClearLocalData()',
    'private void addProfileDescription(',
    'private LinearLayout profileTypeSelector()',
    'private void addProfileCheck(',
    'private void saveProfileTypes()',
    'private boolean validService(',
    'private boolean validServiceUrl(',
    'private void saveService(',
    'private void deleteService('
]:
    s = remove_method(s, sig)

new_settings = r'''private void showSettings(){
        shell("Настройки",2);
        section("Профиль");
        settingButton("Редактировать профиль","Имя, username, описание и Telegram-канал",v->profileSettings());
        settingButton("Музыкальные сервисы","Публичные ссылки на SoundCloud, Spotify, Яндекс Музыку и BeatChain",v->serviceSettings());

        section("Оформление");
        LinearLayout theme=settingRow("Тёмная тема","Комфортный интерфейс Aurora Glass");
        Switch sw=new Switch(this);
        sw.setChecked(dark);
        sw.setOnCheckedChangeListener((button,checked)->{
            if(dark==checked)return;
            dark=checked;
            getPreferences(MODE_PRIVATE).edit().putBoolean("dark_theme",checked).apply();
            configureSystemBars();
            showSettings();
        });
        theme.addView(sw,new LinearLayout.LayoutParams(-2,-2));
        content.addView(theme);

        section("Тип профиля");
        content.addView(profileTypeSelector());

        section("Приватность");
        settingButton("Приватность","Уведомления, видимость профиля, музыкальные разделы и понравившиеся треки",v->privacyDialog());

        section("Данные");
        settingButton("Очистить локальные данные","Удаляет только заметки и временные настройки этого устройства",v->confirmClearLocalData());

        section("Аккаунт");
        Button out=button("Выйти из аккаунта",Color.rgb(65,28,40));
        out.setTextColor(RED);
        out.setOnClickListener(v->{supabase.signOut();getPreferences(MODE_PRIVATE).edit().clear().apply();showWelcome();});
        content.addView(out,new LinearLayout.LayoutParams(-1,dp(50)));
        Button del=button("Удалить аккаунт",Color.rgb(55,25,30));
        del.setTextColor(RED);
        del.setOnClickListener(v->confirmDelete());
        LinearLayout.LayoutParams p=new LinearLayout.LayoutParams(-1,dp(50));
        p.setMargins(0,dp(8),0,0);
        content.addView(del,p);
    }

    private void confirmClearLocalData(){
        new AlertDialog.Builder(this)
            .setTitle("Очистить локальные данные?")
            .setMessage("Удалятся только заметки и временные настройки на этом устройстве. Профиль, чаты и музыка в аккаунте не удаляются.")
            .setNegativeButton("Отмена",null)
            .setPositiveButton("Очистить",(d,w)->{
                boolean keepDark=getPreferences(MODE_PRIVATE).getBoolean("dark_theme",true);
                getPreferences(MODE_PRIVATE).edit().clear().putBoolean("dark_theme",keepDark).apply();
                toast("Локальные данные очищены");
                showSettings();
            }).show();
    }

    private void profileSettings(){
        supabase.getCurrentProfile(new SupabaseClient.Callback(){
            public void onSuccess(String s){try{JsonArray a=JsonParser.parseString(s).getAsJsonArray();if(a.size()>0)runOnUiThread(()->profileDialog(a.get(0).getAsJsonObject()));else toast("Профиль не найден");}catch(Exception e){toast("Не удалось загрузить профиль");}}
            public void onError(Exception e){toast("Не удалось загрузить профиль");}
        });
    }

    private void profileDialog(JsonObject p){
        LinearLayout f=form();
        EditText n=field("Имя",val(p,"display_name"));
        EditText u=field("Username",val(p,"username"));
        EditText b=field("Описание",val(p,"bio"));
        b.setHint("Расскажи о себе, музыке или проекте");
        b.setMinLines(3);b.setMaxLines(5);b.setGravity(Gravity.TOP|Gravity.START);
        b.setInputType(InputType.TYPE_CLASS_TEXT|InputType.TYPE_TEXT_FLAG_CAP_SENTENCES|InputType.TYPE_TEXT_FLAG_MULTI_LINE);
        b.setFilters(new android.text.InputFilter[]{new android.text.InputFilter.LengthFilter(160)});
        EditText tg=field("Telegram-канал",val(p,"telegram_channel_url"));
        f.addView(n);f.addView(u);f.addView(b);f.addView(tg);
        new AlertDialog.Builder(this).setTitle("Редактирование профиля").setMessage("Описание отображается в твоём публичном профиле. Максимум 160 символов.").setView(f).setNegativeButton("Отмена",null).setPositiveButton("Сохранить",(d,w)->{
            String un=u.getText().toString().trim().replace("@","");
            String bio=b.getText().toString().trim();
            JsonObject body=new JsonObject();body.addProperty("display_name",n.getText().toString().trim());
            if(un.isEmpty())body.add("username",JsonNull.INSTANCE);else body.addProperty("username",un);
            body.addProperty("bio",bio);body.addProperty("telegram_channel_url",tg.getText().toString().trim());body.addProperty("is_hidden",un.isEmpty());
            supabase.request("PATCH","/rest/v1/profiles?id=eq."+userId,body.toString(),new SupabaseClient.Callback(){public void onSuccess(String s){toast("Профиль сохранён");showProfile();}public void onError(Exception e){toast("Не удалось сохранить профиль");}});
        }).show();
    }

    private void serviceSettings(){
        String[] names={"SoundCloud","Spotify","Яндекс Музыка","BeatChain"};
        String[] platforms={"soundcloud","spotify","yandex_music","beatchain"};
        new AlertDialog.Builder(this).setTitle("Музыкальные сервисы").setItems(names,(d,w)->editService(platforms[w],names[w])).show();
    }

    private void editService(String platform,String title){
        EditText e=input("https://...");
        String saved=getPreferences(MODE_PRIVATE).getString("service_"+platform,"");e.setText(saved);
        new AlertDialog.Builder(this).setTitle(title).setMessage("Публичная ссылка на профиль или страницу артиста. Пароль и OAuth-данные не нужны.").setView(e)
            .setNegativeButton(saved.isEmpty()?"Отмена":"Удалить",(d,w)->{if(!saved.isEmpty()){getPreferences(MODE_PRIVATE).edit().remove("service_"+platform).apply();deleteService(platform);}})
            .setPositiveButton("Сохранить",(d,w)->{String url=e.getText().toString().trim();if(!validService(platform,url)){toast("Неверная ссылка для "+title);return;}saveService(platform,url);}).show();
    }

    private boolean validService(String platform,String url){
        try{Uri u=Uri.parse(url);String h=u.getHost();if(h==null)return false;String scheme=u.getScheme();if(!"https".equalsIgnoreCase(scheme)&&!"http".equalsIgnoreCase(scheme))return false;h=h.toLowerCase(Locale.US);
            if(platform.equals("soundcloud"))return h.equals("soundcloud.com")||h.endsWith(".soundcloud.com");
            if(platform.equals("spotify"))return h.equals("open.spotify.com")||h.equals("spotify.com")||h.endsWith(".spotify.com");
            if(platform.equals("yandex_music"))return h.equals("music.yandex.ru")||h.equals("music.yandex.com")||h.endsWith(".yandex.ru");
            if(platform.equals("beatchain"))return h.contains("beatchain");
            return false;
        }catch(Exception e){return false;}
    }

    private void saveService(String platform,String url){
        JsonObject b=new JsonObject();b.addProperty("profile_id",userId);b.addProperty("platform",platform);b.addProperty("url",url);
        supabase.request("POST","/rest/v1/social_links?on_conflict=profile_id,platform",b.toString(),new SupabaseClient.Callback(){public void onSuccess(String s){getPreferences(MODE_PRIVATE).edit().putString("service_"+platform,url).apply();toast("Сервис привязан");}public void onError(Exception e){toast("Не удалось сохранить сервис");}});
    }
    private void deleteService(String platform){supabase.request("DELETE","/rest/v1/social_links?profile_id=eq."+userId+"&platform=eq."+platform,null,new SupabaseClient.Callback(){public void onSuccess(String s){toast("Сервис удалён");}public void onError(Exception e){toast("Не удалось удалить сервис");}});}

    private void privacyDialog(){
        LinearLayout f=form();
        Switch n=new Switch(this);n.setText("Уведомления");n.setTextColor(TEXT);n.setChecked(getPreferences(MODE_PRIVATE).getBoolean("notifications_enabled",true));
        Switch h=new Switch(this);h.setText("Скрыть профиль");h.setTextColor(TEXT);
        Switch m=new Switch(this);m.setText("Скрыть музыкальные разделы");m.setTextColor(TEXT);
        Switch l=new Switch(this);l.setText("Скрыть понравившуюся музыку");l.setTextColor(TEXT);
        f.addView(n);f.addView(h);f.addView(m);f.addView(l);
        new AlertDialog.Builder(this).setTitle("Приватность").setMessage("Эти параметры определяют, какие части профиля и активности доступны другим пользователям.").setView(f).setNegativeButton("Отмена",null).setPositiveButton("Сохранить",(d,w)->{
            getPreferences(MODE_PRIVATE).edit().putBoolean("notifications_enabled",n.isChecked()).apply();
            JsonObject body=new JsonObject();body.addProperty("notifications_enabled",n.isChecked());body.addProperty("is_hidden",h.isChecked());body.addProperty("hide_music_sections",m.isChecked());body.addProperty("hide_liked_music",l.isChecked());
            supabase.request("PATCH","/rest/v1/profiles?id=eq."+userId,body.toString(),new SupabaseClient.Callback(){public void onSuccess(String s){toast("Приватность сохранена");}public void onError(Exception e){toast("Не удалось сохранить приватность");}});
        }).show();
    }

    private LinearLayout profileTypeSelector(){
        LinearLayout box=card();box.setOrientation(LinearLayout.VERTICAL);box.setPadding(dp(16),dp(8),dp(16),dp(8));
        addProfileCheck(box,"Исполнитель","artist");addProfileCheck(box,"Битмейкер","beatmaker");return box;
    }
    private void addProfileCheck(LinearLayout box,String label,String key){
        boolean checked=getPreferences(MODE_PRIVATE).getBoolean("profile_"+key,false);LinearLayout row=new LinearLayout(this);row.setGravity(Gravity.CENTER_VERTICAL);
        TextView t=txt(label,15,TEXT,true);row.addView(t,new LinearLayout.LayoutParams(0,dp(54),1));TextView mark=txt(checked?"✓":"○",25,checked?CYAN:MUTED,true);mark.setGravity(Gravity.CENTER);row.addView(mark,new LinearLayout.LayoutParams(dp(54),dp(54)));
        row.setOnClickListener(v->{boolean next=!getPreferences(MODE_PRIVATE).getBoolean("profile_"+key,false);getPreferences(MODE_PRIVATE).edit().putBoolean("profile_"+key,next).apply();mark.setText(next?"✓":"○");mark.setTextColor(next?CYAN:MUTED);saveProfileTypes();});box.addView(row);
    }
    private void saveProfileTypes(){boolean artist=getPreferences(MODE_PRIVATE).getBoolean("profile_artist",false),beatmaker=getPreferences(MODE_PRIVATE).getBoolean("profile_beatmaker",false);JsonObject b=new JsonObject();b.addProperty("is_artist",artist);b.addProperty("is_beatmaker",beatmaker);b.addProperty("profile_type",artist&&beatmaker?"artist_beatmaker":artist?"artist":beatmaker?"beatmaker":"user");supabase.request("PATCH","/rest/v1/profiles?id=eq."+userId,b.toString(),new SupabaseClient.Callback(){public void onSuccess(String s){toast("Тип профиля сохранён");}public void onError(Exception e){toast("Не удалось сохранить тип профиля");}});}

    '''

s = replace_method(s, 'private void showSettings()', new_settings + '\n    ')
for sig, body in [
    ('private void profileSettings()', new_settings.split('private void profileSettings()',1)[1].split('private void profileDialog',1)[0]),
]:
    pass

# The showSettings replacement already includes all following helpers. Remove any old
# helper duplicates that may remain below it, then append only one copy of each helper.
# Locate the new helper block boundaries by removing all duplicates again and inserting
# canonical methods directly after showSettings.
for sig in ['private void profileSettings()','private void profileDialog(','private void serviceSettings()','private void editService(','private boolean validService(','private void saveService(','private void deleteService(','private void privacyDialog()','private LinearLayout profileTypeSelector()','private void addProfileCheck(','private void saveProfileTypes()','private void confirmClearLocalData()']:
    # Keep the first occurrence (the one in new_settings), remove only later copies.
    first=s.find(sig)
    if first<0: continue
    tail=s[first+1:]
    while sig in tail:
        pos=first+1+tail.find(sig)
        brace=s.find('{',pos);depth=0
        for i in range(brace,len(s)):
            if s[i]=='{':depth+=1
            elif s[i]=='}':
                depth-=1
                if depth==0:
                    s=s[:pos]+s[i+1:]
                    break
        tail=s[first+1:]

# Fix profile description only inside showProfile, not an arbitrary first payload.
# Remove stale helper and inject a fresh helper immediately before showProfile.
s=remove_method(s,'private void addProfileDescription(')
helper='''private void addProfileDescription(JsonObject p){String bio=val(p,"bio").trim();if(!bio.isEmpty()){section("О себе");TextView d=txt(bio,14,TEXT,false);d.setLineSpacing(dp(2),1.05f);d.setPadding(dp(14),dp(12),dp(14),dp(12));d.setBackground(gradient(SURFACE2,Color.rgb(28,40,57),18));content.addView(d);}}\n    '''
idx=s.find('private void showProfile()')
if idx>=0:s=s[:idx]+helper+s[idx:]

# Insert description after the profile object inside showProfile only.
start=s.find('private void showProfile()')
if start>=0:
    end=s.find('\n    private ',start+10)
    if end<0:end=len(s)
    block=s[start:end]
    needle='JsonObject p=a.get(0).getAsJsonObject();'
    if needle in block and 'addProfileDescription(p);' not in block:
        block=block.replace(needle,needle+'addProfileDescription(p);',1)
        s=s[:start]+block+s[end:]

TARGET.write_text(s,encoding='utf-8')
