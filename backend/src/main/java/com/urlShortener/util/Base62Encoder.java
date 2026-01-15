package com.urlShortener.util;

public class Base62Encoder {
    public static String encode(Long id){
        StringBuilder sb = new StringBuilder("");
        int remainder = 16; // example
        String base62 = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

        while (id!=0){
            int rem =(int)(id%62);
            sb.append(base62.charAt(rem));
            id/=62;
        }
        return sb.reverse().toString();
    }
}
