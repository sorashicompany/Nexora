from pathlib import Path

TARGET=Path('app/src/main/java/com/nexora/music/MainActivity.java')
s=TARGET.read_text(encoding='utf-8')

def replace_method(src, signature, replacement):
    start=src.find(signature)
    if start<0: raise SystemExit(f'missing {signature}')
    brace=src.find('{',start); depth=0
    for i in range(brace,len(src)):
        if src[i]=='{': depth+=1
        elif src[i]=='}':
            depth-=1
            if depth==0:return src[:start]+replacement+src[i+1:]
    raise SystemExit(f'unclosed {signature}')

privacy=r'''private void privacyDialog(){
        supabase.getCurrentProfile(new SupabaseClient.Callback(){
            public void onSuccess(String s){
                try{JsonArray a=JsonParser.parseString(s).getAsJsonArray();
                    JsonObject p=a.size()>0?a.get(0).getAsJsonObject():new JsonObject();
                    runOnUiThread(()->showPrivacyDialog(p));
                }catch(Exception e){runOnUiThread(()->showPrivacyDialog(new JsonObject()));}
            }
            public void onError(Exception e){runOnUiThread(()->showPrivacyDialog(new JsonObject()));}
        });
    }
    private void showPrivacyDialog(JsonObject p){
        LinearLayout f=form();
        boolean notifications= getPreferences(MODE_PRIVATE).getBoolean("notifications_enabled",true);
        Switch n=new Switch(this);n.setText("Уведомления");n.setTextColor(TEXT);n.setChecked(notifications);
        Switch h=new Switch(this);h.setText("Скрыть профиль");h.setTextColor(TEXT);h.setChecked("true".equals(val(p,"is_hidden")));
        Switch m=new Switch(this);m.setText("Скрыть музыкальные разделы");m.setTextColor(TEXT);m.setChecked("true".equals(val(p,"hide_music_sections")));
        Switch l=new Switch(this);l.setText("Скрыть понравившуюся музыку");l.setTextColor(TEXT);l.setChecked("true".equals(val(p,"hide_liked_music")));
        f.addView(n);f.addView(h);f.addView(m);f.addView(l);
        new AlertDialog.Builder(this).setTitle("Приватность").setMessage("Эти параметры определяют, какие части профиля и активности доступны другим пользователям.").setView(f).setNegativeButton("Отмена",null).setPositiveButton("Сохранить",(d,w)->{
            getPreferences(MODE_PRIVATE).edit().putBoolean("notifications_enabled",n.isChecked()).apply();
            JsonObject body=new JsonObject();body.addProperty("notifications_enabled",n.isChecked());body.addProperty("is_hidden",h.isChecked());body.addProperty("hide_music_sections",m.isChecked());body.addProperty("hide_liked_music",l.isChecked());
            supabase.request("PATCH","/rest/v1/profiles?id=eq."+userId,body.toString(),new SupabaseClient.Callback(){public void onSuccess(String x){toast("Приватность сохранена");}public void onError(Exception e){toast("Не удалось сохранить приватность");}});
        }).show();
    }'''

services=r'''private void serviceSettings(){
        String[] names={"SoundCloud","Spotify","Яндекс Музыка","BeatChain"};
        String[] platforms={"soundcloud","spotify","yandex_music","beatchain"};
        supabase.request("GET","/rest/v1/social_links?select=platform,url&profile_id=eq."+userId,null,new SupabaseClient.Callback(){
            public void onSuccess(String s){try{JsonArray a=JsonParser.parseString(s).getAsJsonArray();for(JsonElement e:a){JsonObject o=e.getAsJsonObject();getPreferences(MODE_PRIVATE).edit().putString("service_"+val(o,"platform"),val(o,"url")).apply();}runOnUiThread(()->showServiceChooser(names,platforms));}catch(Exception e){runOnUiThread(()->showServiceChooser(names,platforms));}}
            public void onError(Exception e){runOnUiThread(()->showServiceChooser(names,platforms));}
        });
    }
    private void showServiceChooser(String[] names,String[] platforms){new AlertDialog.Builder(this).setTitle("Музыкальные сервисы").setItems(names,(d,w)->editService(platforms[w],names[w])).show();}'''

s=replace_method(s,'private void privacyDialog()',privacy)
s=replace_method(s,'private void serviceSettings()',services)
TARGET.write_text(s,encoding='utf-8')
