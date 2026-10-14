// TINY ARCADE SEAT v1 - place in a sit prim in Second Life.
// Set SERVER to your public HTTPS website address (no trailing slash).
// Match SECRET to ARCADE_SECRET on the Node.js server.
// Script is intended for ONE seat / ONE player.

string SERVER = "https://YOUR-SERVER-URL";
string SECRET = "CHANGE-ME-123";
key gSitter = NULL_KEY;
integer gControls = 0;
integer gLastSent = -1;

integer sendInput(integer value)
{
    string url = SERVER + "/input?key=" + llEscapeURL(SECRET);
    llHTTPRequest(url, [HTTP_METHOD, "POST", HTTP_MIMETYPE, "application/x-www-form-urlencoded"], "move=" + (string)value);
    gLastSent = value;
    return TRUE;
}

integer stopGame()
{
    llSetTimerEvent(0.0);
    if (gSitter != NULL_KEY)
    {
        sendInput(0);
    }
    llReleaseControls();
    gSitter = NULL_KEY;
    gControls = 0;
    gLastSent = -1;
    return TRUE;
}

default
{
    state_entry()
    {
        llSetSitText("PLAY ARCADE");
        llSetSitTarget(<0.0, 0.0, 0.45>, ZERO_ROTATION);
        gSitter = NULL_KEY;
    }

    changed(integer change)
    {
        if (change & CHANGED_LINK)
        {
            key sitter = llAvatarOnSitTarget();
            if (sitter != gSitter)
            {
                stopGame();
                if (sitter != NULL_KEY)
                {
                    gSitter = sitter;
                    llRequestPermissions(sitter, PERMISSION_TAKE_CONTROLS);
                }
            }
        }
    }

    run_time_permissions(integer permissions)
    {
        if ((permissions & PERMISSION_TAKE_CONTROLS) && (llAvatarOnSitTarget() == gSitter))
        {
            integer flags = CONTROL_FWD | CONTROL_BACK | CONTROL_ROT_LEFT | CONTROL_ROT_RIGHT | CONTROL_LEFT | CONTROL_RIGHT;
            llTakeControls(flags, TRUE, FALSE);
            sendInput(0);
            llSetTimerEvent(0.35);
            llRegionSayTo(gSitter, 0, "Arcade ready. Use W A S D or the arrow keys to collect coins.");
        }
    }

    control(key id, integer held, integer change)
    {
        if (id != gSitter)
        {
            return;
        }
        integer move = 0;
        if (held & CONTROL_FWD) move = move | 1;
        if (held & CONTROL_BACK) move = move | 2;
        if (held & (CONTROL_ROT_LEFT | CONTROL_LEFT)) move = move | 4;
        if (held & (CONTROL_ROT_RIGHT | CONTROL_RIGHT)) move = move | 8;
        gControls = move;
        if (move != gLastSent)
        {
            sendInput(move);
        }
    }

    timer()
    {
        if (gSitter != NULL_KEY)
        {
            sendInput(gControls);
        }
    }
}
