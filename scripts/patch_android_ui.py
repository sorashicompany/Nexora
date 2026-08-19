from pathlib import Path

p = Path('app/src/main/java/com/nexora/music/MainActivity.java')
s = p.read_text()


def replace_method(src, signature, replacement):
    start = src.find(signature)
    if start < 0:
        raise SystemExit(f'missing {signature}')
    brace = src.find('{', start)
    depth = 0
    for i in range(brace, len(src)):
        if src[i] == '{':
            depth += 1
        elif src[i] == '}':
            depth -= 1
            if depth == 0:
                return src[:start] + replacement + src[i + 1:]
    raise SystemExit(f'unclosed {signature}')


def remove_all_methods(src, signature):
    while signature in src:
        src = replace_method(src, signature, '')
    return src

# Keep the patch idempotent: remove old settings helpers before inserting the
# current implementation.
for sig in [
    'private LinearLayout profileTypeSelector()',
    'private void addProfileCheck(',
    'private void saveProfileTypes()',
    'private View serviceSettingsRow(',
    'private LinearLayout serviceSettingsRow(',
    'private void editPublicService(',
    'private boolean validServiceUrl(',
    'private void saveService(',
    'private void deleteService(',
    'private String visibleProfileTypes(',
    'private ImageView icon('
]:
    s = remove_all_methods(s, sig)

new_settings = '''private void showSettings(){
        shell("Настройки",2);
        section("Профиль");
        settingButton("Редактировать профиль","Имя, username, описание и Telegram-канал",v->profileSettings());
        settingButton("Музыкальные сервисы","Публичные ссылки на SoundCloud, Spotify, Яндекс Музыку и BeatChain",v->serviceSettings());

        section("Оформление");
        LinearLayout theme=settingRow("Тёмная тема","Комфортный интерфейс Aurora Glass");
        Switch sw=new Switch(this);
        sw.setChecked(dark);
        sw.setOnCheckedChangeListener((button,checked)->{
            if (dark==checked) return;
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
        settingButton("Очистить локальные данные","Удаляет только локальные заметки и временные данные этого устройства",v->confirmClearLocalData());

        section("Аккаунт");
        Button out=button("Выйти из аккаунта",Color.rgb(65,28,40));
        out.setTextColor(RED);
        out.setOnClickListener(v->{
            supabase.signOut();
            getPreferences(MODE_PRIVATE).edit().clear().apply();
            showWelcome();
        });
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
            .setMessage("Будут удалены только сохранённые заметки и локальные настройки Nexora на этом устройстве. Профиль, чаты и музыка в аккаунте не удаляются.")
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
            public void onSuccess(String s){
                try{
                    JsonArray a=JsonParser.parseString(s).getAsJsonArray();
                    if(a.size()>0) runOnUiThread(()->profileDialog(a.get(0).getAsJsonObject()));
                    else toast("Профиль не найден");
                }catch(Exception e){toast("Не удалось загрузить профиль");}
            }
            public void onError(Exception e){toast("Не удалось загрузить профиль");}
        });
    }

    private void profileDialog(JsonObject p){
        LinearLayout f=form();
        EditText n=field("Имя",val(p,"display_name"));
        EditText u=field("Username",val(p,"username"));
        EditText b=field("Описание",val(p,"bio"));
        b.setHint("Расскажи о себе, музыке или проекте");
        b.setMinLines(3);
        b.setMaxLines(5);
        b.setGravity(Gravity.TOP|Gravity.START);
        EditText tg=field("Telegram-канал",val(p,"telegram_channel_url"));
        f.addView(n);f.addView(u);f.addView(b);f.addView(tg);
        new AlertDialog.Builder(this)
            .setTitle("Редактирование профиля")
            .setMessage("Описание будет показано в твоём публичном профиле. Максимум 160 символов.")
            .setView(f)
            .setNegativeButton("Отмена",null)
            .setPositiveButton("Сохранить",(d,w)->{
                String un=u.getText().toString().trim().replace("@","");
                String bio=b.getText().toString().trim();
                if(bio.length()>160){toast("Описание не должно быть длиннее 160 символов");return;}
                JsonObject body=new JsonObject();
                body.addProperty("display_name",n.getText().toString().trim());
                if(un.isEmpty()) body.add("username",JsonNull.INSTANCE); else body.addProperty("username",un);
                body.addProperty("bio",bio);
                body.addProperty("telegram_channel_url",tg.getText().toString().trim());
                body.addProperty("is_hidden",un.isEmpty());
                supabase.request("PATCH","/rest/v1/profiles?id=eq."+userId,body.toString(),new SupabaseClient.Callback(){
                    public void onSuccess(String s){toast("Профиль сохранён");showProfile();}
                    public void onError(Exception e){toast("Не удалось сохранить профиль");}
                });
            }).show();
    }

    private void serviceSettings(){
        String[] names={"SoundCloud","Spotify","Яндекс Музыка","BeatChain"};
        String[] platforms={"soundcloud","spotify","yandex_music","beatchain"};
        new AlertDialog.Builder(this).setTitle("Музыкальные сервисы").setItems(names,(d,w)->editService(platforms[w],names[w])).show();
    }

    private void editService(String platform,String title){
        EditText e=input("https://...");
        String saved=getPreferences(MODE_PRIVATE).getString("service_"+platform,"");
        e.setText(saved);
        new AlertDialog.Builder(this)
            .setTitle(title)
            .setMessage("Публичная ссылка. OAuth и пароль не требуются.")
            .setView(e)
            .setNegativeButton(saved.isEmpty()?"Отмена":"Удалить",(d,w)->{
                if(saved.isEmpty()) return;
                getPreferences(MODE_PRIVATE).edit().remove("service_"+platform).apply();
                deleteService(platform);
            })
            .setPositiveButton("Сохранить",(d,w)->{
                String u=e.getText().toString().trim();
                if(!validService(platform,u)){toast("Неверная ссылка для "+title);return;}
                getPreferences(MODE_PRIVATE).edit().putString("service_"+platform,u).apply();
                saveService(platform,u);
            }).show();
    }

    private boolean validService(String platform,String url){
        try{
            Uri u=Uri.parse(url);String h=u.getHost();
            if(h==null)return false;
            String scheme=u.getScheme();
            if(!"https".equalsIgnoreCase(scheme)&&!"http".equalsIgnoreCase(scheme))return false;
            h=h.toLowerCase(Locale.US);
            if(platform.equals("soundcloud"))return h.equals("soundcloud.com")||h.endsWith(".soundcloud.com");
            if(platform.equals("spotify"))return h.equals("open.spotify.com")||h.equals("spotify.com")||h.endsWith(".spotify.com");
            if(platform.equals("yandex_music"))return h.equals("music.yandex.ru")||h.equals("music.yandex.com")||h.endsWith(".yandex.ru");
            if(platform.equals("beatchain"))return h.contains("beatchain");
            return false;
        }catch(Exception e){return false;}
    }

    private void saveService(String platform,String url){
        JsonObject b=new JsonObject();b.addProperty("profile_id",userId);b.addProperty("platform",platform);b.addProperty("url",url);
        supabase.request("POST","/rest/v1/social_links?on_conflict=profile_id,platform",b.toString(),new SupabaseClient.Callback(){
            public void onSuccess(String s){toast("Сервис привязан");}
            public void onError(Exception e){toast("Не удалось сохранить сервис");}
        });
    }

    private void deleteService(String platform){
        supabase.request("DELETE","/rest/v1/social_links?profile_id=eq."+userId+"&platform=eq."+platform,null,new SupabaseClient.Callback(){
            public void onSuccess(String s){toast("Сервис удалён");}
            public void onError(Exception e){toast("Не удалось удалить сервис");}
        });
    }

    private void privacyDialog(){
        LinearLayout f=form();
        Switch n=new Switch(this);n.setText("Уведомления");n.setTextColor(TEXT);n.setChecked(getPreferences(MODE_PRIVATE).getBoolean("notifications_enabled",true));
        Switch h=new Switch(this);h.setText("Скрыть профиль");h.setTextColor(TEXT);
        Switch m=new Switch(this);m.setText("Скрыть музыкальные разделы");m.setTextColor(TEXT);
        Switch l=new Switch(this);l.setText("Скрыть понравившуюся музыку");l.setTextColor(TEXT);
        f.addView(n);f.addView(h);f.addView(m);f.addView(l);
        new AlertDialog.Builder(this).setTitle("Приватность").setMessage("Эти параметры определяют, какие части профиля и активности доступны другим пользователям.").setView(f).setNegativeButton("Отмена",null).setPositiveButton("Сохранить",(d,w)->{
            getPreferences(MODE_PRIVATE).edit().putBoolean("notifications_enabled",n.isChecked()).apply();
            JsonObject b=new JsonObject();b.addProperty("notifications_enabled",n.isChecked());b.addProperty("is_hidden",h.isChecked());b.addProperty("hide_music_sections",m.isChecked());b.addProperty("hide_liked_music",l.isChecked());
            supabase.request("PATCH","/rest/v1/profiles?id=eq."+userId,b.toString(),new SupabaseClient.Callback(){public void onSuccess(String s){toast("Приватность сохранена");}public void onError(Exception e){toast("Не удалось сохранить приватность");}});
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
    private void saveProfileTypes(){
        boolean artist=getPreferences(MODE_PRIVATE).getBoolean("profile_artist",false),beatmaker=getPreferences(MODE_PRIVATE).getBoolean("profile_beatmaker",false);
        JsonObject b=new JsonObject();b.addProperty("is_artist",artist);b.addProperty("is_beatmaker",beatmaker);b.addProperty("profile_type",artist&&beatmaker?"artist_beatmaker":artist?"artist":beatmaker?"beatmaker":"user");
        supabase.request("PATCH","/rest/v1/profiles?id=eq."+userId,b.toString(),new SupabaseClient.Callback(){public void onSuccess(String s){toast("Тип профиля сохранён");}public void onError(Exception e){toast("Не удалось сохранить тип профиля");}});
    }
'''

# Be tolerant of a previously generated MainActivity that no longer contains
# showSettings. The settings workflow is also responsible for installing the
# canonical implementation, so append it inside the class instead of failing.
if 'private void showSettings()' in s:
    s=replace_method(s,'private void showSettings()',new_settings)
else:
    end=s.rfind('}')
    if end<0:
        raise SystemExit('missing MainActivity closing brace')
    s=s[:end]+"\n    "+new_settings+"\n"+s[end:]

p.write_text(s)
