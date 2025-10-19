from dotenv import load_dotenv
import os
load_dotenv()
print('SUPABASE_URL=', os.getenv('SUPABASE_URL'))
print('SUPABASE_KEY present=', bool(os.getenv('SUPABASE_KEY')))
try:
    from config import supabase
    print('Creado supabase client:', supabase is not None)
    res = supabase.table('producto').select('*').limit(1).execute()
    print('Query OK. Data:', getattr(res,'data',None))
except Exception as e:
    import traceback
    print('Error:', type(e).__name__, e)
    traceback.print_exc()
