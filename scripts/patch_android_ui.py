from pathlib import Path

p = Path('app/src/main/java/com/nexora/music/MainActivity.java')
s = p.read_text()

# Fix the compile error introduced by the service cards returning View.
s = s.replace('LinearLayout scCard=serviceCard(', 'View scCard=serviceCard(')
s = s.replace('LinearLayout bcCard=serviceCard(', 'View bcCard=serviceCard(')


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


# Settings: profile roles are independent checkmarks; neither selected means ordinary user.
new_settings = '''private void showSettings(){showShell("Настройки",2);TextView kicker=text("NEXORA • STUDIO",11,CYAN,true);kicker.setPadding(0,dp(8),0,dp(2));content.addView(kicker);sectionTitle("Настройки");content.addView(setting("Воспроизведение","Автовоспроизведение превью","ON"));content.addView(setting("Качество аудио","Высокое качество","›"));content.addView(setting("Уведомления","Сообщения и новые релизы","ON"));sectionTitle("Тип профиля");content.addView(profileTypeSelector());sectionTitle("Музыкальные сервисы");content.addView(serviceSettingsRow("SoundCloud","Публичная ссылка на профиль","soundcloud",CYAN));content.addView(serviceSettingsRow("Spotify","Публичная ссылка на профиль","spotify",GREEN));content.addView(serviceSettingsRow("Яндекс Музыка","Публичная ссылка на профиль","yandex_music",VIOLET));content.addView(serviceSettingsRow("BeatChain","Публичная ссылка на профиль битмейкера","beatchain",BLUE));sectionTitle("Аккаунт");content.addView(setting("Приватность","Контроль видимости профиля","›"));content.addView(setting("Telegram","Используется только для входа","✓"));content.addView(spacer(12));Button out=button("Выйти из аккаунта",Color.rgb(65,28,40));out.setTextColor(Color.rgb(255,110,130));out.setOnClickListener(v->{supabase.signOut();getPreferences(MODE_PRIVATE).edit().putBoolean("welcome_seen",false).apply();showWelcome();});content.addView(out,new LinearLayout.LayoutParams(-1,dp(50)));}'''
s = replace_method(s, 'private void showSettings()', new_settings)

helpers = '''private LinearLayout profileTypeSelector(){LinearLayout box=card();box.setOrientation(LinearLayout.VERTICAL);box.setPadding(dp(16),dp(8),dp(16),dp(8));addProfileCheck(box,"Исполнитель","artist",getPreferences(MODE_PRIVATE).getBoolean("profile_artist",false));addProfileCheck(box,"Битмейкер","beatmaker",getPreferences(MODE_PRIVATE).getBoolean("profile_beatmaker",false));return box;}
    private void addProfileCheck(LinearLayout box,String label,String key,boolean checked){LinearLayout row=new LinearLayout(this);row.setGravity(Gravity.CENTER_VERTICAL);TextView t=text(label,15,TEXT,true);row.addView(t,new LinearLayout.LayoutParams(0,dp(54),1));TextView mark=text(checked?"✓":"○",25,checked?CYAN:MUTED,true);mark.setGravity(Gravity.CENTER);row.addView(mark,new LinearLayout.LayoutParams(dp(54),dp(54)));row.setOnClickListener(v->{boolean next=!getPreferences(MODE_PRIVATE).getBoolean("profile_"+key,false);getPreferences(MODE_PRIVATE).edit().putBoolean("profile_"+key,next).apply();mark.setText(next?"✓":"○");mark.setTextColor(next?CYAN:MUTED);saveProfileTypes();});box.addView(row);}
    private void saveProfileTypes(){boolean artist=getPreferences(MODE_PRIVATE).getBoolean("profile_artist",false),beatmaker=getPreferences(MODE_PRIVATE).getBoolean("profile_beatmaker",false);JsonObject b=new JsonObject();b.addProperty("is_artist",artist);b.addProperty("is_beatmaker",beatmaker);b.addProperty("profile_type",artist&&beatmaker?"artist_beatmaker":artist?"artist":beatmaker?"beatmaker":"user");supabase.request("PATCH","/rest/v1/profiles?id=eq."+userId,b.toString(),new SupabaseClient.Callback(){public void onSuccess(String s){toast("Тип профиля сохранён");}public void onError(Exception e){toast("Не удалось сохранить тип профиля");}});}
    private LinearLayout serviceSettingsRow(String title,String subtitle,String platform,int accent){LinearLayout row=serviceCard(title,subtitle,accent);row.setOnClickListener(v->editPublicService(platform,title));return row;}
    private void editPublicService(String platform,String title){final EditText input=input("https://");String saved=getPreferences(MODE_PRIVATE).getString("service_"+platform,"");input.setText(saved);new AlertDialog.Builder(this).setTitle(title).setView(input).setNegativeButton("Удалить",(d,w)->{getPreferences(MODE_PRIVATE).edit().remove("service_"+platform).apply();deleteService(platform);}).setPositiveButton("Сохранить",(d,w)->{String url=input.getText().toString().trim();if(!validServiceUrl(platform,url)){toast("Неверная ссылка для "+title);return;}getPreferences(MODE_PRIVATE).edit().putString("service_"+platform,url).apply();saveService(platform,url);}).show();}
    private boolean validServiceUrl(String platform,String url){try{Uri u=Uri.parse(url);String h=u.getHost();if(h==null)return false;h=h.toLowerCase();if(platform.equals("soundcloud"))return h.equals("soundcloud.com")||h.endsWith(".soundcloud.com");if(platform.equals("spotify"))return h.equals("open.spotify.com")||h.equals("spotify.com")||h.endsWith(".spotify.com");if(platform.equals("yandex_music"))return h.equals("music.yandex.ru")||h.equals("music.yandex.com")||h.endsWith(".yandex.ru");if(platform.equals("beatchain"))return h.contains("beatchain");return false;}catch(Exception e){return false;}}
    private void saveService(String platform,String url){JsonObject b=new JsonObject();b.addProperty("profile_id",userId);b.addProperty("platform",platform);b.addProperty("url",url);supabase.request("POST","/rest/v1/social_links?on_conflict=profile_id,platform",b.toString(),new SupabaseClient.Callback(){public void onSuccess(String s){toast("Сервис привязан");}public void onError(Exception e){toast("Не удалось сохранить сервис");}});}
    private void deleteService(String platform){supabase.request("DELETE","/rest/v1/social_links?profile_id=eq."+userId+"&platform=eq."+platform,null,new SupabaseClient.Callback(){public void onSuccess(String s){toast("Сервис удалён");}public void onError(Exception e){toast("Не удалось удалить сервис");}});}
    private String visibleProfileTypes(JsonObject p){boolean artist=p.has("is_artist")&&!p.get("is_artist").isJsonNull()&&p.get("is_artist").getAsBoolean();boolean beatmaker=p.has("is_beatmaker")&&!p.get("is_beatmaker").isJsonNull()&&p.get("is_beatmaker").getAsBoolean();if(artist&&beatmaker)return "Исполнитель • Битмейкер";if(artist)return "Исполнитель";if(beatmaker)return "Битмейкер";return "";}
    '''
marker = 'private void showProfile()'
if marker not in s:
    raise SystemExit('missing showProfile marker')
s = s.replace(marker, helpers + marker, 1)

# Profile only displays creator roles. Ordinary-user status stays hidden.
old = 'String type=p.has("profile_type")&&!p.get("profile_type").isJsonNull()?p.get("profile_type").getAsString():"user";'
s = s.replace(old, 'String type=visibleProfileTypes(p);', 1)

# Load role checkmarks from the server profile.
needle = 'JsonObject p=a.get(0).getAsJsonObject();'
replacement = 'JsonObject p=a.get(0).getAsJsonObject();if(p.has("is_artist"))getPreferences(MODE_PRIVATE).edit().putBoolean("profile_artist",p.get("is_artist").getAsBoolean()).putBoolean("profile_beatmaker",p.has("is_beatmaker")&&p.get("is_beatmaker").getAsBoolean()).apply();'
s = s.replace(needle, replacement, 1)

# Do not show the ordinary-user label in the profile header/details.
s = s.replace('profileTypeLabel(type)', 'type')

p.write_text(s)
print('patched', p)
